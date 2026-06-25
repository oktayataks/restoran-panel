export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  orderCount: number;
  lastOrder: string;
}

const STORAGE_KEY = 'taby_customers';

export const getCustomers = (): Customer[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveCustomer = (data: {
  name: string;
  phone: string;
  address: string;
}) => {
  const customers = getCustomers();
  const existing = customers.find(c => c.phone === data.phone);

  if (existing) {
    existing.name = data.name;
    existing.address = data.address;
    existing.orderCount += 1;
    existing.lastOrder = new Date().toISOString();
  } else {
    customers.push({
      id: Date.now().toString(),
      name: data.name,
      phone: data.phone,
      address: data.address,
      orderCount: 1,
      lastOrder: new Date().toISOString(),
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};

export const deleteCustomer = (id: string) => {
  const customers = getCustomers().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};
