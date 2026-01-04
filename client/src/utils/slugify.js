export function toSlug(str) {
  return str
    .toLowerCase()
    .normalize("NFD") // Chuẩn hóa ký tự tiếng Việt có dấu thành không dấu
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu thanh
    .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ các ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-") // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-"); // Loại bỏ dấu gạch ngang dư thừa
}
