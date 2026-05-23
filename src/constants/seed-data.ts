export type SeedCategory = {
  name: string;
  icon: string;
};

export type SeedGroup = {
  name: string;
  icon: string;
  color: string;
  categories: SeedCategory[];
};

export const INITIAL_GROUPS: SeedGroup[] = [
  {
    name: 'Hogar',
    icon: 'house.fill',
    color: '#2563eb',
    categories: [
      { name: 'Renta', icon: 'building.2.fill' },
      { name: 'Servicios', icon: 'bolt.fill' },
      { name: 'Supermercado', icon: 'cart.fill' },
    ],
  },
  {
    name: 'Transporte',
    icon: 'car.fill',
    color: '#7c3aed',
    categories: [
      { name: 'Combustible', icon: 'fuelpump.fill' },
      { name: 'Transporte público', icon: 'bus.fill' },
      { name: 'Mantenimiento', icon: 'wrench.fill' },
    ],
  },
  {
    name: 'Alimentación',
    icon: 'fork.knife',
    color: '#ea580c',
    categories: [
      { name: 'Restaurantes', icon: 'cup.and.saucer.fill' },
      { name: 'Delivery', icon: 'bag.fill' },
      { name: 'Café', icon: 'mug.fill' },
    ],
  },
  {
    name: 'Salud',
    icon: 'heart.fill',
    color: '#dc2626',
    categories: [
      { name: 'Farmacia', icon: 'pills.fill' },
      { name: 'Consultas', icon: 'stethoscope' },
    ],
  },
  {
    name: 'Ocio',
    icon: 'gamecontroller.fill',
    color: '#db2777',
    categories: [
      { name: 'Suscripciones', icon: 'play.rectangle.fill' },
      { name: 'Salidas', icon: 'ticket.fill' },
    ],
  },
  {
    name: 'Finanzas',
    icon: 'banknote.fill',
    color: '#059669',
    categories: [
      { name: 'Ahorro', icon: 'leaf.fill' },
      { name: 'Deudas', icon: 'creditcard.fill' },
      { name: 'Impuestos', icon: 'doc.text.fill' },
    ],
  },
  {
    name: 'Otros',
    icon: 'ellipsis.circle.fill',
    color: '#64748b',
    categories: [{ name: 'Varios', icon: 'tag.fill' }],
  },
];
