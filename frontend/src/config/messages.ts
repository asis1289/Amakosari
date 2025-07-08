export const adminMessages = {
  // Success Messages
  success: {
    category: {
      created: 'Category created successfully!',
      updated: 'Category updated successfully!',
      deleted: 'Category deleted successfully!'
    },
    product: {
      created: 'Product created successfully!',
      updated: 'Product updated successfully!',
      deleted: 'Product deleted successfully!'
    },
    collection: {
      created: 'Collection created successfully!',
      updated: 'Collection updated successfully!',
      deleted: 'Collection deleted successfully!'
    },
    offer: {
      created: 'Offer created successfully!',
      updated: 'Offer updated successfully!',
      deleted: 'Offer deleted successfully!'
    },
    sale: {
      created: 'Sale created successfully!',
      updated: 'Sale updated successfully!',
      deleted: 'Sale deleted successfully!'
    },
    user: {
      created: 'User created successfully!',
      updated: 'User updated successfully!',
      deleted: 'User deleted successfully!'
    },
    order: {
      updated: 'Order updated successfully!',
      deleted: 'Order deleted successfully!'
    }
  },
  
  // Error Messages
  error: {
    category: {
      create: 'Failed to create category. Please try again.',
      update: 'Failed to update category. Please try again.',
      delete: 'Failed to delete category. Please try again.',
      hasProducts: 'Cannot delete category with existing products.'
    },
    product: {
      create: 'Failed to create product. Please try again.',
      update: 'Failed to update product. Please try again.',
      delete: 'Failed to delete product. Please try again.'
    },
    collection: {
      create: 'Failed to create collection. Please try again.',
      update: 'Failed to update collection. Please try again.',
      delete: 'Failed to delete collection. Please try again.'
    },
    offer: {
      create: 'Failed to create offer. Please try again.',
      update: 'Failed to update offer. Please try again.',
      delete: 'Failed to delete offer. Please try again.'
    },
    sale: {
      create: 'Failed to create sale. Please try again.',
      update: 'Failed to update sale. Please try again.',
      delete: 'Failed to delete sale. Please try again.'
    },
    user: {
      create: 'Failed to create user. Please try again.',
      update: 'Failed to update user. Please try again.',
      delete: 'Failed to delete user. Please try again.'
    },
    order: {
      update: 'Failed to update order. Please try again.',
      delete: 'Failed to delete order. Please try again.'
    }
  },
  
  // Confirmation Messages
  confirm: {
    category: {
      delete: 'Are you sure you want to delete this category? This action cannot be undone.',
      deleteWithProducts: 'This category has products. Deleting it will also remove all associated products. Are you sure?'
    },
    product: {
      delete: 'Are you sure you want to delete this product? This action cannot be undone.'
    },
    collection: {
      delete: 'Are you sure you want to delete this collection? This action cannot be undone.'
    },
    offer: {
      delete: 'Are you sure you want to delete this offer? This action cannot be undone.'
    },
    sale: {
      delete: 'Are you sure you want to delete this sale? This action cannot be undone.'
    },
    user: {
      delete: 'Are you sure you want to delete this user? This action cannot be undone.'
    },
    order: {
      delete: 'Are you sure you want to delete this order? This action cannot be undone.'
    }
  }
};

export const getMessage = (type: 'success' | 'error' | 'confirm', entity: string, action: string): string => {
  const typeMessages = adminMessages[type] as Record<string, Record<string, string>>;
  const entityMessages = typeMessages[entity];
  return entityMessages?.[action] || 
         `${action.charAt(0).toUpperCase() + action.slice(1)} ${entity} ${type === 'success' ? 'successfully' : 'failed'}.`;
}; 