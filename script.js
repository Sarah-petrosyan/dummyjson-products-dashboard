const $ = s => document.querySelector(s)

async function getApi(url) {
    if (!url) {
        throw new Error('empty url field')
    }
    try {
        let data = await fetch(url)

        if (!data.ok) {
            throw data.status
        }
        return await data.json()

    } catch (e) {
        if (e >= 400 && e < 500) {
            throw 'system error'
        } else if (e >= 500) {
            throw 'connection error'
        }
        throw 'some error'
    }

}
let productEl = $('#card')
let categoryEl = $('#catList')
let modalEl=$('#modal')
let closeModalEl=$('#closeModal')
let searchEl=$('#q')
let sortByEl = $('#sortBy')
let orderEl = $('#order')

let modalImgEL = $('#modalImg')
const mTitleEl = $('#mTitle')
const mDescEl = $('#mDesc')
const mPriceEl = $('#mPrice')
const mStockEl = $('#mStock')
const mPillsEl = $('#mPills')

getApi('https://dummyjson.com/products').then(data => {
    renderProducts(data.products)
}).catch(err => {
    console.log(err)
})

function renderProducts(data){
    productEl.innerHTML = data.map(product => `
     <div class="card" data-id="${product.id}">
          <div class="thumb">
            <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
            <div class="discount">-${product.discountPercentage}%</div>
            <div class="rating">★ ${product.rating}</div>
          </div>
          <div class="body">
            <div class="title">${product.title}</div>
            <div class="desc">${product.description}</div>
            <div class="row">
              <div class="price">${product.price} <small>USD</small></div>
              <div class="mini">${product.category}</div>
            </div>
          </div>
     </div>
    `).join('')
}

getApi('https://dummyjson.com/products/categories').then(categories => {
    console.log(categories)
    categoryEl.innerHTML = categories.map(cat => `
       <div class="cat" data-slug="${cat.slug}">
        <div class="name">${cat.slug}</div>
     <span class="badge">${cat.name}</span>
</div>`).join('')
}).catch(err => {
    console.log(err)
})

categoryEl.onclick = function (e) {
    const catEl = e.target.closest('.cat')
    if (!catEl) {
        return
    }

    const slug = catEl.dataset.slug

    if (!slug) {
        return
    }

    categoryEl.querySelector('.cat.active')?.classList.remove('active')
    catEl.classList.add('active')

    getApi(`https://dummyjson.com/products/category/${slug}`).then(data => {
        renderProducts(data.products)
    }).catch(err => {
        console.log(err)
    })
}

function openModal(product) {
    modalEl.classList.remove('d-none')

    modalImgEL.innerHTML = `<img src="${product.thumbnail}" alt="${product.title}">`
    mTitleEl.textContent = product.title
    mDescEl.textContent = product.description
    mPriceEl.textContent = `${product.price}`
    mStockEl.textContent = `stock: ${product.stock}`

    mPillsEl.innerHTML = `
        <span class="pill">${product.category}</span>
        <span class="pill">★ ${product.rating}</span>
    `
}

closeModalEl.onclick = function () {
    modalEl.classList.add('d-none')
}

modalEl.onclick = function (e) {
    if (e.target === modalEl) {
        modalEl.classList.add('d-none')
    }
}

productEl.onclick = function (e) {
    const card = e.target.closest('.card')
    if (!card){
        return
    }

    let id =card.dataset.id
    getApi(`https://dummyjson.com/products/${id}`).then(product => {
        openModal(product)
    }).catch(err => {
        console.log(err)
    })
}

searchEl.oninput = function () {
    const search = searchEl.value.trim()

    if (!search) {
        getApi('https://dummyjson.com/products').then(data => {
            renderProducts(data.products)
        }).catch(err => {
            console.log(err)
        })
        return
    }

    getApi(`https://dummyjson.com/products/search?q=${search}`).then(data => {
            renderProducts(data.products)
        }).catch(err => {
            console.log(err)
        })
}

function loadSortedProducts() {
    const sortBy = sortByEl.value
    const order = orderEl.value

    if (!sortBy) {
        getApi('https://dummyjson.com/products').then(data => {
            renderProducts(data.products)
        }).catch(err => {
            console.log(err)
        })
        return
    }
    getApi(`https://dummyjson.com/products?sortBy=${sortBy}&order=${order}`).then(data => {
        renderProducts(data.products)
    }).catch(err => {
        console.log(err)
    })


}

sortByEl.onchange = loadSortedProducts
orderEl.onchange = loadSortedProducts
