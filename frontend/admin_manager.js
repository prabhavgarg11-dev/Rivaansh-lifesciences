/**
 * admin_manager.js — Rivaansh Lifesciences Admin Logic
 * Handles dashboard statistics and product inventory updates.
 */

window.updateAdminStats = async function() {
    const e = (id) => document.getElementById(id);
    if (!e('adminPanelPage')) return;

    try {
        const token = localStorage.getItem('rv_admin_token');
        const res = await fetch(`${API}/api/admin/stats`, {
            headers: token ? { 'x-admin-token': token } : {}
        });
        if (!res.ok) throw new Error('API down');
        const stats = await res.json();
        
        if (e('adminOrdersCount')) e('adminOrdersCount').textContent = stats.orders || 0;
        if (e('adminPrescriptionsCount')) e('adminPrescriptionsCount').textContent = stats.prescriptions || 0;
        if (e('adminUsersCount')) e('adminUsersCount').textContent = stats.users || 1;
        if (e('adminProductsCount')) e('adminProductsCount').textContent = stats.products || _allProducts.length;
    } catch (err) {
        if (e('adminOrdersCount')) e('adminOrdersCount').textContent = (_orders || []).length;
        if (e('adminPrescriptionsCount')) e('adminPrescriptionsCount').textContent = (_prescriptions || []).length;
        if (e('adminUsersCount')) e('adminUsersCount').textContent = 1;
        if (e('adminProductsCount')) e('adminProductsCount').textContent = (_allProducts || []).length;
    }
};

window.adminAddProduct = async function() {
    const name = document.getElementById('apName').value;
    const price = document.getElementById('apPrice').value;
    if (!name || !price) { toast('Name and Price are mandatory', 'error'); return; }

    const payload = {
        name,
        price: Number(price),
        originalPrice: document.getElementById('apOrigPrice').value ? Number(document.getElementById('apOrigPrice').value) : null,
        category: document.getElementById('apCat').value,
        brand: document.getElementById('apBrand').value || 'Rivaansh',
        composition: document.getElementById('apComp').value || 'Clinical Formulation',
        image: document.getElementById('apImg').value || 'https://placehold.co/400x300/e0f5f2/0a7c6e?text=New+Med',
        description: document.getElementById('apDesc').value || 'New clinical product from Rivaansh Lifesciences.'
    };

    try {
        const token = localStorage.getItem('rv_admin_token');
        const res = await fetch(`${API}/api/admin/products`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'x-admin-token': token } : {})
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create product on backend');
        const newP = await res.json();
        _allProducts.unshift(newP);
        toast('✅ Product created successfully', 'success');
        
        // Reset form
        document.querySelectorAll('.admin-form-card input, .admin-form-card textarea').forEach(i => i.value = '');
        if (document.getElementById('adminProductForm')) document.getElementById('adminProductForm').classList.add('hidden');
        
        refreshProductGrids();
        updateAdminStats();
    } catch (err) {
        console.error(err);
        toast('Admin error: Could not save product to server.', 'error');
    }
};
