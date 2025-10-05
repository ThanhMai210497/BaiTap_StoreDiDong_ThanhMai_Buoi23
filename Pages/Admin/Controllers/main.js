let newBtn = document.querySelector(".btn");
let dialog = document.querySelector(".modal-dialog");
let form = document.querySelector(".form-grid");

let modal = document.getElementById("md-product");
let edittingId = null;

let btnSave = document.querySelector(".btn-primary");
let btnCancel = document.querySelector(".btn-ghost");
let btnClose = document.querySelector(".close");

let nameInput = document.querySelector(".name");
let priceInput = document.querySelector(".price");
let screenInput = document.querySelector(".screen");
let typeSelect = document.querySelector(".type");
let imgInput = document.querySelector(".img");
let descInput = document.querySelector(".desc");
let extraImgInput = document.querySelector(".extraImg");

newBtn.addEventListener("click", () => {
  form.reset();

  modal.hidden = false;
});

function closeModal() {
  modal.hidden = true;
  form.reset();
  edittingId = null;
}

modal.addEventListener("click", (e) => {
  if (e.target === modal) return closeModal();

  if (e.target.closest(".close") || e.target.closest("[data-close]")) {
    e.preventDefault();
    return closeModal();
  }
});

let fetchListPhone = () => {
  phoneService
    .getList()
    .then((res) => {
      let list = res.data;
      renderListPhone(list);
    })
    .catch((err) => {
      console.log("🚀 ~ fetchListPhone ~ err:", err);
    });
};

fetchListPhone();

let renderListPhone = (Products) => {
  let contentHTML = "";
  Products.reverse().forEach((Product) => {
    let { id, name, price, screen, type, img, desc } = Product;

    let trString = `
<tr>
<td> ${id} </td>
<td> ${name} </td>
<td> ${price} </td>
<td> ${screen} </td> 
<td> ${type} </td>
<td>
<img src="${img}" style="width: 56px;height:56px;object-fit:cover;border-radius:8px">
 </td>
<td> ${desc} </td>

<td>
<button onclick="editPhone('${id}')" class="btn btn-success">Edit</button>
</td>

<td>
<button onclick="deletePhone('${id}')" class="btn btn-warning">Delete</button>
</td>

</tr>
`;
    contentHTML += trString;
  });
  document.getElementById("tbody").innerHTML = contentHTML;
};

// let deletePhone = (idProduct) => {
//   phoneService
//     .deleteById(idProduct)
//     .then((res) => {
//       console.log("🚀 ~ deletePhone ~ res:", res);
//       fetchListPhone();
//     })
//     .catch((err) => {
//       console.log("🚀 ~ deletePhone ~ err:", err);
//     });
// };

//
let deletePhone = (idProduct) => {
  phoneService
    .deleteById(idProduct)
    .then((res) => {
      fetchListPhone();
      showToast("🗑️ Đã xóa sản phẩm thành công!"); // ✅ hiện thông báo
    })
    .catch((err) => {
      console.log("🚀 ~ deletePhone ~ err:", err);
      showToast("❌ Lỗi khi xóa sản phẩm!"); // ❌ báo lỗi
    });
};

//
let getFormData = () => {
  let name = nameInput.value.trim();
  let price = Number(priceInput.value);
  let screen = screenInput.value.trim();
  let type = typeSelect.value;
  let img = imgInput.value.trim();
  let desc = descInput.value.trim();

  // ✅ Lấy dữ liệu ảnh phụ (chuỗi link, ngăn cách bởi dấu phẩy)
  let extraImgs = extraImgInput.value
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url !== "");

  return {
    name,
    price,
    screen,
    type,
    img,
    desc,
    images: extraImgs, // ✅ gửi mảng ảnh phụ thật sự lên API
  };
};

let setFormData = (phone) => {
  nameInput.value = phone.name ?? "";
  priceInput.value = phone.price ?? "";
  screenInput.value = phone.screen ?? "";
  typeSelect.value = phone.type ?? "";
  imgInput.value = phone.img ?? "";
  descInput.value = phone.desc ?? "";
  extraImgInput.value = (phone.images || []).join(", ");
};

let checkValidate = () => {
  let ok = true;
  let name = nameInput.value.trim();
  let reName = /^[\p{L} ]+$/u;

  if (name === "") {
    ok = false;
    alert("không để trống name");
  } else if (!reName.test(name)) {
    ok = false;
    alert("name chỉ gồm chữ và khoảng trắng");
  }

  let price = priceInput.value.trim();

  if (price === "") {
    ok = false;
    alert("không để trống price");
  } else {
    let rePrice = parseInt(price.replace(/[^\d]/g, ""), 10);
    if (!isFinite(rePrice)) {
      ok = false;
      alert("price phải là số");
    }
  }

  let screen = screenInput.value.trim();
  if (screen === "") {
    ok = false;
    alert("không để trống screen");
  }

  let type = typeSelect.value.trim().toLowerCase();
  let reType = new Set(["iphone", "samsung"]);

  if (!reType.has(type)) {
    ok = false;
    alert("type chỉ có thể là iphone hoặc samsung");
  }

  return ok;
};
// thêm

// ✅ Tạo sản phẩm (Promise-based)
let createProduct = () => {
  if (!checkValidate()) return Promise.reject();
  let newProduct = getFormData();

  return phoneService
    .createProduct(newProduct)
    .then((res) => {
      fetchListPhone();
      closeModal();
      return res;
    })
    .catch((err) => {
      console.log("🚀 ~ createProduct ~ err:", err);
      throw err;
    });
};

// ✅ Cập nhật sản phẩm
let updatePhone = () => {
  if (!checkValidate()) return Promise.reject();
  let updateProduct = getFormData();

  return phoneService
    .updateProduct(edittingId, updateProduct)
    .then((result) => {
      fetchListPhone();
      closeModal();
      edittingId = null;
      return result;
    })
    .catch((err) => {
      console.log("🚀 ~ updatePhone ~ err:", err);
      throw err;
    });
};

// ✅ Toast animation
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ✅ Bắt sự kiện submit form
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Form submitted ✅");

  if (!edittingId) {
    try {
      await createProduct();
      showToast("✅ Tạo sản phẩm thành công!");
    } catch {
      showToast("❌ Có lỗi khi tạo sản phẩm!");
    }
  } else {
    try {
      await updatePhone();
      showToast("✅ Cập nhật sản phẩm thành công!");
    } catch {
      showToast("❌ Có lỗi khi cập nhật!");
    }
  }
});
document.getElementById("btnSave").addEventListener("click", (e) => {
  e.preventDefault();
  form.requestSubmit(); // ép form chạy event submit
});
