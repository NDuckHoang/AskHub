const categoryModel = require('../models/categoryModel');

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateInput({ name, description }) {
  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    return 'Tên danh mục phải có từ 2 đến 100 ký tự';
  }
  if (description && description.trim().length > 255) {
    return 'Mô tả không được vượt quá 255 ký tự';
  }
  return null;
}

async function getCategories(req, res) {
  const categories = await categoryModel.findAll();
  res.json({ categories });
}

async function createCategory(req, res) {
  const error = validateInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { name, description } = req.body;
  const existing = await categoryModel.findByName(name.trim());
  if (existing) {
    return res.status(409).json({ message: 'Danh mục đã tồn tại' });
  }

  const id = await categoryModel.create({ name: name.trim(), description: description?.trim() });
  const category = await categoryModel.findById(id);
  res.status(201).json({ message: 'Tạo danh mục thành công', category });
}

async function updateCategory(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const category = await categoryModel.findById(id);
  if (!category) {
    return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  }

  const error = validateInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { name, description } = req.body;
  const existing = await categoryModel.findByName(name.trim());
  if (existing && existing.id !== id) {
    return res.status(409).json({ message: 'Tên danh mục đã được sử dụng' });
  }

  await categoryModel.update(id, { name: name.trim(), description: description?.trim() });
  const updated = await categoryModel.findById(id);
  res.json({ message: 'Cập nhật danh mục thành công', category: updated });
}

async function deleteCategory(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'id không hợp lệ' });
  }

  const category = await categoryModel.findById(id);
  if (!category) {
    return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  }

  // Xóa category không xóa câu hỏi, chỉ gỡ liên kết (category_id -> NULL, xem schema.sql)
  await categoryModel.remove(id);
  res.json({ message: 'Đã xóa danh mục' });
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
