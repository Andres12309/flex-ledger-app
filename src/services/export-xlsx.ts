import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import type { AppDatabase } from '@/src/db/client';
import { getAllExpensesForExport } from '@/src/repositories/expenses';
import { getUserSettings } from '@/src/repositories/user-settings';
import { formatMoney } from '@/src/utils/currency';

function centsToAmount(cents: number): number {
  return Math.round(cents) / 100;
}

export async function exportExpensesToXlsx(database: AppDatabase): Promise<string> {
  const rows = await getAllExpensesForExport(database);
  const settings = await getUserSettings(database);
  const currency = settings?.currency ?? 'USD';
  const exportedAt = format(new Date(), 'yyyy-MM-dd HH:mm');

  const gastosSheet = rows.map((row) => ({
    Fecha: format(new Date(row.occurredAt), 'yyyy-MM-dd HH:mm'),
    Grupo: row.groupName,
    Categoría: row.categoryName,
    Monto: centsToAmount(row.amountCents),
    Moneda: currency,
    Nota: row.note ?? '',
  }));

  const byCategory = new Map<string, { group: string; total: number; count: number }>();
  for (const row of rows) {
    const key = `${row.groupName} › ${row.categoryName}`;
    const prev = byCategory.get(key) ?? { group: row.groupName, total: 0, count: 0 };
    prev.total += row.amountCents;
    prev.count += 1;
    byCategory.set(key, prev);
  }

  const categoriaSheet = [...byCategory.entries()]
    .map(([label, data]) => ({
      Grupo: data.group,
      Categoría: label.split(' › ')[1] ?? label,
      Movimientos: data.count,
      Total: centsToAmount(data.total),
      Moneda: currency,
      '% del total':
        rows.length > 0
          ? Number(((data.total / rows.reduce((s, r) => s + r.amountCents, 0)) * 100).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.Total - a.Total);

  const byGroup = new Map<string, number>();
  for (const row of rows) {
    byGroup.set(row.groupName, (byGroup.get(row.groupName) ?? 0) + row.amountCents);
  }

  const grupoSheet = [...byGroup.entries()].map(([group, total]) => ({
    Grupo: group,
    Total: centsToAmount(total),
    Moneda: currency,
  }));

  const byMonth = new Map<string, number>();
  for (const row of rows) {
    const month = format(new Date(row.occurredAt), 'yyyy-MM');
    byMonth.set(month, (byMonth.get(month) ?? 0) + row.amountCents);
  }

  const mesSheet = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      Mes: month,
      Total: centsToAmount(total),
      Moneda: currency,
    }));

  const totalCents = rows.reduce((sum, r) => sum + r.amountCents, 0);
  const metaSheet = [
    { Campo: 'App', Valor: 'Flex Ledger' },
    { Campo: 'Exportado', Valor: exportedAt },
    { Campo: 'Moneda', Valor: currency },
    { Campo: 'Movimientos', Valor: rows.length },
    { Campo: 'Total', Valor: formatMoney(totalCents, currency) },
    { Campo: 'Ciclo de vida', Valor: settings?.lifecycleType ?? '—' },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(gastosSheet), 'Gastos');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(categoriaSheet), 'Por categoría');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(grupoSheet), 'Por grupo');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mesSheet), 'Por mes');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(metaSheet), 'Info');

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  const fileName = `flex-ledger-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  const uri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Exportar Flex Ledger',
      UTI: 'com.microsoft.excel.xlsx',
    });
  }

  return uri;
}
