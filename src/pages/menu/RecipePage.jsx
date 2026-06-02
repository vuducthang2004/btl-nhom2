import React, { useEffect, useState } from 'react';
import { menuApi } from '../../api/menuApi';
import { inventoryApi } from '../../api/inventoryApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const RecipePage = () => {
  const { data: items, execute: fetchItems } = useApi(menuApi.getItems);
  const { data: ingredients, execute: fetchIngredients } = useApi(inventoryApi.getIngredients);
  const { data: recipeData, execute: fetchRecipe, loading: loadingRecipe } = useApi(inventoryApi.getMenuItemIngredients);
  const { execute: saveRecipe, loading: saving } = useApi(inventoryApi.setMenuItemIngredients);

  const [selectedItem, setSelectedItem] = useState('');
  const [recipeItems, setRecipeItems] = useState([]);

  useEffect(() => {
    fetchItems();
    fetchIngredients();
  }, [fetchItems, fetchIngredients]);

  useEffect(() => {
    if (selectedItem) {
      fetchRecipe(selectedItem).then(data => {
        setRecipeItems(Array.isArray(data) ? data : []);
      }).catch(err => {
        Promise.resolve().then(() => setRecipeItems([]));
      });
    } else {
      Promise.resolve().then(() => setRecipeItems([]));
    }
  }, [selectedItem, fetchRecipe]);

  const handleAddIngredient = () => {
    setRecipeItems([...recipeItems, { ingredientId: '', quantityPerUnit: '' }]);
  };

  const handleRemoveIngredient = (index) => {
    const newItems = [...recipeItems];
    newItems.splice(index, 1);
    setRecipeItems(newItems);
  };

  const handleChangeIngredient = (index, field, value) => {
    const newItems = [...recipeItems];
    newItems[index][field] = value;
    setRecipeItems(newItems);
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    
    // Clean up empty ones
    const validItems = recipeItems
      .filter(item => item.ingredientId && item.quantityPerUnit)
      .map(item => ({
        ingredientId: Number(item.ingredientId),
        quantityPerUnit: Number(item.quantityPerUnit)
      }));

    try {
      await saveRecipe(selectedItem, { items: validItems });
      alert('Đã lưu công thức thành công!');
    } catch (err) {
      alert('Lỗi khi lưu công thức!');
    }
  };

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2>🧪 Thiết lập Công thức (Định lượng)</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Side: Select Item */}
        <Card>
          <h3 style={{ marginBottom: '16px' }}>1. Chọn món ăn</h3>
          <p className="text-muted" style={{ marginBottom: '12px', fontSize: '14px' }}>
            Chọn món ăn cần thiết lập nguyên liệu để hệ thống tự động trừ kho khi bán.
          </p>
          <select 
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '8px', 
              border: '1px solid var(--color-border)', outline: 'none',
              backgroundColor: '#fafafa', fontSize: '15px'
            }}
          >
            <option value="">-- Click để chọn món --</option>
            {Array.isArray(items) && items.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </Card>

        {/* Right Side: Recipe Editor */}
        <Card>
          <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
            <h3>2. Nguyên liệu (Công thức)</h3>
            {selectedItem && (
              <Button onClick={handleAddIngredient} variant="outline" style={{ padding: '4px 12px' }}>
                + Thêm thành phần
              </Button>
            )}
          </div>

          {!selectedItem ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Vui lòng chọn món ăn ở cột bên trái
            </div>
          ) : loadingRecipe ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải công thức...</div>
          ) : (
            <div>
              {recipeItems.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                  Chưa có nguyên liệu nào. Hãy thêm thành phần.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recipeItems.map((ri, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nguyên liệu</label>
                        <select
                          value={ri.ingredientId}
                          onChange={(e) => handleChangeIngredient(idx, 'ingredientId', e.target.value)}
                          style={{
                            width: '100%', padding: '10px', borderRadius: '6px', 
                            border: '1px solid var(--color-border)', outline: 'none'
                          }}
                        >
                          <option value="">-- Chọn --</option>
                          {Array.isArray(ingredients) && ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Số lượng</label>
                        <input
                          type="number"
                          placeholder="VD: 20"
                          value={ri.quantityPerUnit}
                          onChange={(e) => handleChangeIngredient(idx, 'quantityPerUnit', e.target.value)}
                          style={{
                            width: '100%', padding: '10px', borderRadius: '6px', 
                            border: '1px solid var(--color-border)', outline: 'none'
                          }}
                        />
                      </div>
                      <Button variant="outline" style={{ color: 'red', borderColor: 'red', padding: '10px 14px' }} onClick={() => handleRemoveIngredient(idx)}>
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Đang lưu...' : '💾 Lưu Công thức'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RecipePage;
