/* ============================================================
   SERA accessories
   كل اللي محتاجة تعدّليه موجود في الجزئين اللي تحت: SETTINGS و PRODUCTS.
   باقي الملف مسؤول عن رسم الصفحة، مش لازم تلمسيه.
   ============================================================ */

/* ---------- 1) الإعدادات ---------- */
var DEFAULT_SETTINGS = {
  whatsapp: "01044238420",                    // رقم الواتساب للطلبات (بأي شكل: 01044238420 أو +201044238420)
  instagram: "sera_store_1",                  // اسم حساب إنستجرام من غير @
  tagline: "إكسسوارات بتكمّل إطلالتك",        // العنوان الكبير فوق
  heroText: "قطع رقيقة بتفاصيل ذهبية دافئة، مصممة لترافق يومك وتضيف لمسة SERA.", // الجملة تحت العنوان
  banner: "الطلب بيتم عن طريق واتساب، اختاري قطعتك وابعتي الطلب" // الشريط الغامق في أول الصفحة (سيبيه "" لو مش عايزاه)
};

/* ---------- 2) المنتجات ----------
   لإضافة منتج: انسخي سطر منتج كامل والصقيه وعدّلي عليه (id لازم يكون مختلف عن باقي المنتجات).
   لمسح منتج: امسحي السطر بتاعه.
   name:    اسم المنتج
   cat:     القسم (بيظهر كزرار فلترة، لو كل المنتجات في قسم واحد الأزرار مش بتظهر)
   price:   السعر بالجنيه (سيبيه "" لو مش عايزة تكتبي سعر)
   img:     مسار الصورة، مثال "images/products/gold-hoops.jpg" (سيبيه "" وهيظهر مكانها شكل SERA)
   soldOut: true لو المنتج خلص، false لو متاح
*/
var DEFAULT_PRODUCTS = [
  { id: "p1", name: "حلق دائري ذهبي",   cat: "حلق",   price: 150, img: "", soldOut: false },
  { id: "p2", name: "حلق لؤلؤ كلاسيك",  cat: "حلق",   price: 180, img: "", soldOut: false },
  { id: "p3", name: "سلسلة رفيعة بقلب", cat: "سلاسل", price: 220, img: "", soldOut: false },
  { id: "p4", name: "سلسلة حرف اسمك",   cat: "سلاسل", price: 260, img: "", soldOut: false },
  { id: "p5", name: "أسورة ناعمة",       cat: "أساور", price: 190, img: "", soldOut: false },
  { id: "p6", name: "طقم أساور ٣ قطع",  cat: "أساور", price: 300, img: "", soldOut: false }
];

/* ============================================================
   من هنا لتحت: كود الصفحة
   ============================================================ */
(function(){
var state = { settings: Object.assign({}, DEFAULT_SETTINGS), products: DEFAULT_PRODUCTS.slice() };
var remoteEnabled = !!(window.SERA_SUPABASE_URL && window.SERA_SUPABASE_ANON_KEY && window.supabase);
var sb = remoteEnabled ? window.supabase.createClient(window.SERA_SUPABASE_URL, window.SERA_SUPABASE_ANON_KEY) : null;
state.settings.whatsapp = normNum(state.settings.whatsapp);
var app = document.getElementById('app');
var filter = '', query = '';
var cart = [];
var drawer, backdrop, dlist, dtotal, checkout, cartBadge;
document.documentElement.dir = 'rtl';

function el(tag, attrs){
  var e = document.createElement(tag);
  var a = attrs || {};
  Object.keys(a).forEach(function(k){
    var v = a[k];
    if (v === false || v == null) return;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.slice(0,2) === 'on') e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, v);
  });
  for (var i = 2; i < arguments.length; i++){
    [].concat(arguments[i]).forEach(function(kid){
      if (kid == null || kid === false) return;
      e.append(kid.nodeType ? kid : document.createTextNode(kid));
    });
  }
  return e;
}
function fmtPrice(p){
  if (p === '' || p == null || isNaN(Number(p))) return null;
  return Number(p).toLocaleString('en-US');
}
function normNum(v){
  var d = String(v || '').replace(/[٠-٩]/g, function(c){ return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); }).replace(/\D/g, '');
  if (d.indexOf('00') === 0) d = d.slice(2);
  if (d.charAt(0) === '0' && d.length === 11) d = '20' + d.slice(1);
  return d;
}
function waBase(){ return state.settings.whatsapp ? 'https://wa.me/' + state.settings.whatsapp : null; }
function cats(){
  var seen = [];
  state.products.filter(function(p){ return p.active !== false; }).forEach(function(p){ if (p.cat && seen.indexOf(p.cat) < 0) seen.push(p.cat); });
  return seen;
}
function logo(file, alt){ return el('img', {src: 'images/' + file, alt: alt || '', width: 1240, height: 980}); }
var CART_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>';
var CLOSE_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
var SEARCH_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
function svgEl(str){ var d = document.createElement('div'); d.innerHTML = str; return d.firstChild; }

/* ---------- cart ---------- */
function cartTotals(){
  var q = 0, t = 0;
  cart.forEach(function(i){ q += i.qty; t += i.price * i.qty; });
  return {q: q, t: t};
}
function orderLink(){
  var base = waBase();
  if (!base || !cart.length) return null;
  var lines = [], total = 0;
  cart.forEach(function(i){
    lines.push('• ' + i.name + ' × ' + i.qty + (i.price ? ' = ' + (i.price * i.qty) + ' ج.م' : ''));
    total += i.price * i.qty;
  });
  var msg = 'أهلاً SERA accessories، عايزة أطلب:\n' + lines.join('\n') + (total ? '\nالإجمالي: ' + total + ' ج.م' : '');
  return base + '?text=' + encodeURIComponent(msg);
}
function updateCart(){
  if (!dlist) return;
  var tot = cartTotals();
  cartBadge.textContent = tot.q; cartBadge.hidden = tot.q === 0;
  dtotal.textContent = tot.t.toLocaleString('en-US') + ' ج.م';
  dlist.textContent = '';
  if (!cart.length){
    dlist.append(el('p', {class: 'dempty', text: 'حقيبتك فاضية دلوقتي. اختاري قطعة تحبيها.'}));
  } else {
    cart.forEach(function(item){
      var th = el('div', {class: 'thumb'}, item.img ? el('img', {src: item.img, alt: ''}) : el('div', {class: 'ph', 'aria-hidden': 'true', style: 'font-size:.75rem', text: 'SERA'}));
      var minus = el('button', {type: 'button', 'aria-label': 'تقليل الكمية', text: '−', onclick: function(){ item.qty -= 1; if (item.qty <= 0) cart.splice(cart.indexOf(item), 1); updateCart(); }});
      var plus = el('button', {type: 'button', 'aria-label': 'زيادة الكمية', text: '+', onclick: function(){ item.qty += 1; updateCart(); }});
      dlist.append(el('article', {class: 'citem'}, th, el('div', {},
        el('p', {class: 'ctitle', text: item.name}),
        item.price ? el('span', {class: 'price'}, fmtPrice(item.price) + ' ', el('small', {text: 'ج.م'})) : null,
        el('div', {class: 'cact'}, el('div', {class: 'qty'}, minus, el('span', {text: String(item.qty)}), plus),
          el('button', {class: 'rm', type: 'button', text: 'شيليه', onclick: function(){ cart.splice(cart.indexOf(item), 1); updateCart(); }})))));
    });
  }
  var link = orderLink();
  if (link){ checkout.setAttribute('href', link); checkout.classList.remove('off'); }
  else { checkout.removeAttribute('href'); checkout.classList.add('off'); }
}
function openCart(){ drawer.classList.add('open'); backdrop.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); var c = drawer.querySelector('.dh button'); if (c) c.focus(); }
function closeCart(){ drawer.classList.remove('open'); backdrop.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
function addToCart(p){
  var found = cart.filter(function(i){ return i.id === p.id; })[0];
  if (found) found.qty += 1; else cart.push({id: p.id, name: p.name, price: Number(p.price) || 0, img: p.img || '', qty: 1});
  updateCart(); openCart();
}
function buildDrawer(){
  backdrop = el('div', {class: 'backdrop', onclick: closeCart});
  dlist = el('div', {class: 'dlist'});
  dtotal = el('b', {text: '0 ج.م'});
  checkout = el('a', {class: 'btn full off', target: '_blank', rel: 'noopener', text: 'إتمام الطلب على واتساب'});
  drawer = el('aside', {class: 'drawer', 'aria-label': 'حقيبة التسوق', 'aria-hidden': 'true'},
    el('div', {class: 'dh'}, el('h2', {text: 'حقيبة التسوق'}), el('button', {class: 'icon-btn', type: 'button', 'aria-label': 'إغلاق الحقيبة', onclick: closeCart}, svgEl(CLOSE_SVG))),
    dlist,
    el('div', {class: 'df'}, el('div', {class: 'total'}, el('span', {text: 'الإجمالي'}), dtotal), checkout,
      el('span', {class: 'dnote', text: 'هيتفتح واتساب برسالة جاهزة فيها طلبك.'})));
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeCart(); });
}


/* ---------- صفحة تفاصيل المنتج ---------- */
var detail, inSite = false;
function imgsOf(p){ return (p.images && p.images.length) ? p.images : (p.img ? [p.img] : []); }
function hideDetail(){
  if (!detail) return;
  detail.hidden = true; detail.textContent = '';
  document.body.style.overflow = '';
}
function closeDetail(){
  if (inSite) history.back(); else location.replace('#products');
}
function showProduct(p){
  var list = imgsOf(p), cur = 0, startX = null;
  var main = el('div', {class: 'pd-main'});
  var thumbsBox = el('div', {class: 'pd-thumbs'});
  function paint(){
    main.textContent = '';
    main.append(list.length ? el('img', {src: list[cur], alt: p.name}) : el('div', {class: 'ph', 'aria-hidden': 'true', text: 'SERA'}));
    if (p.soldOut) main.append(el('span', {class: 'tag sold', text: 'خلصت'}));
    if (list.length > 1){
      main.append(
        el('button', {class: 'pd-nav prev', type: 'button', 'aria-label': 'الصورة السابقة', text: '›', onclick: function(){ cur = (cur - 1 + list.length) % list.length; paint(); }}),
        el('button', {class: 'pd-nav next', type: 'button', 'aria-label': 'الصورة التالية', text: '‹', onclick: function(){ cur = (cur + 1) % list.length; paint(); }}));
    }
    [].forEach.call(thumbsBox.children, function(b, i){ b.setAttribute('aria-current', String(i === cur)); });
  }
  list.forEach(function(u, i){
    if (list.length < 2) return;
    thumbsBox.append(el('button', {type: 'button', 'aria-label': 'صورة ' + (i + 1), onclick: function(){ cur = i; paint(); }}, el('img', {src: u, alt: ''})));
  });
  main.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, {passive: true});
  main.addEventListener('touchend', function(e){
    if (startX == null || list.length < 2) return;
    var dx = e.changedTouches[0].clientX - startX; startX = null;
    if (Math.abs(dx) < 40) return;
    cur = dx < 0 ? (cur + 1) % list.length : (cur - 1 + list.length) % list.length; paint();
  }, {passive: true});
  var pr = fmtPrice(p.price), base = waBase();
  var add = el('button', {class: 'btn full', type: 'button', disabled: !!p.soldOut, text: p.soldOut ? 'خلصت' : 'أضيفي للحقيبة', onclick: function(){ addToCart(p); }});
  var ask = base ? el('a', {class: 'btn alt full', href: base + '?text=' + encodeURIComponent('أهلاً SERA accessories، عايزة أسأل عن: ' + p.name), target: '_blank', rel: 'noopener', text: 'اسألي عنها على واتساب'}) : null;
  detail.textContent = '';
  detail.append(el('div', {class: 'pd-in'},
    el('button', {class: 'pd-back', type: 'button', text: '→ رجوع للمنتجات', onclick: closeDetail}),
    el('div', {class: 'pd-grid'},
      el('div', {}, main, thumbsBox),
      el('div', {class: 'pd-info'},
        p.cat ? el('span', {class: 'pd-cat', text: p.cat}) : null,
        el('h1', {text: p.name}),
        pr ? el('div', {class: 'pd-price'}, pr + ' ', el('small', {text: 'ج.م'})) : null,
        p.desc ? el('p', {class: 'pd-desc', text: p.desc}) : null,
        el('div', {class: 'pd-btns'}, add, ask)))));
  paint();
  detail.hidden = false; detail.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  document.title = p.name + ' | SERA accessories';
}
function route(){
  var h = location.hash;
  if (h.indexOf('#product/') === 0){
    var id = decodeURIComponent(h.slice(9));
    var p = state.products.filter(function(x){ return String(x.id) === id && x.active !== false; })[0];
    if (p){ showProduct(p); return; }
  }
  document.title = 'SERA accessories';
  hideDetail();
}
function buildDetail(){
  detail = el('div', {class: 'pd', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'تفاصيل المنتج'});
  document.body.append(detail);
  window.addEventListener('hashchange', function(){ inSite = true; route(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && detail && !detail.hidden && !drawer.classList.contains('open')) closeDetail();
  });
}

/* ---------- page ---------- */
function productCard(p){
  var pr = fmtPrice(p.price);
  var link = '#product/' + encodeURIComponent(p.id);
  var media = el('a', {class: 'media', href: link, 'aria-label': p.name},
    p.img ? el('img', {src: p.img, alt: p.name, loading: 'lazy'}) : el('div', {class: 'ph', 'aria-hidden': 'true', text: 'SERA'}),
    p.soldOut ? el('span', {class: 'tag sold', text: 'خلصت'}) : null);
  var add = el('button', {class: 'add', type: 'button', disabled: !!p.soldOut, text: p.soldOut ? 'خلصت' : 'أضيفي للحقيبة', onclick: function(){ addToCart(p); }});
  var node = el('li', {class: 'card'}, media, el('div', {class: 'det'},
    p.cat ? el('span', {class: 'cat', text: p.cat}) : null,
    el('h3', {class: 'name'}, el('a', {href: link, text: p.name})),
    el('div', {class: 'row-b'}, pr ? el('span', {class: 'price'}, pr + ' ', el('small', {text: 'ج.م'})) : el('span'), add)));
  return node;
}
function renderGrid(){
  var chipsBox = document.getElementById('chips'), grid = document.getElementById('grid'), empty = document.getElementById('empty');
  var cs = cats();
  if (filter && cs.indexOf(filter) < 0) filter = '';
  chipsBox.textContent = '';
  chipsBox.hidden = cs.length < 2;
  if (cs.length > 1) [''].concat(cs).forEach(function(c){
    chipsBox.append(el('button', {class: 'chip', type: 'button', 'aria-pressed': String(filter === c), text: c || 'الكل', onclick: function(){ filter = c; renderGrid(); }}));
  });
  var q = query.trim().toLowerCase();
  var list = state.products.filter(function(p){
    if (p.active === false) return false;
    return (!filter || p.cat === filter) && (!q || (p.name + ' ' + (p.cat || '')).toLowerCase().indexOf(q) >= 0);
  });
  grid.textContent = '';
  list.forEach(function(p){ grid.append(productCard(p)); });
  empty.hidden = list.length > 0;
  empty.textContent = state.products.filter(function(p){return p.active !== false;}).length ? 'مفيش قطعة بالاسم ده. جرّبي كلمة تانية.' : 'المنتجات قريباً.';
}
function render(){
  var s = state.settings;
  app.textContent = '';
  var head = el('header', {class: 'header'}, el('div', {class: 'wrap header-row'},
    el('a', {class: 'brand', href: '#home', 'aria-label': 'SERA accessories'}, logo('logo-gold.svg', 'SERA accessories')),
    el('nav', {class: 'nav', 'aria-label': 'التنقل الرئيسي'}, el('a', {href: '#home', text: 'الرئيسية'}), el('a', {href: '#products', text: 'المنتجات'}), el('a', {href: '#about', text: 'عن SERA'})),
    (function(){
      cartBadge = el('span', {class: 'badge', hidden: true, text: '0'});
      var b = el('button', {class: 'icon-btn', type: 'button', 'aria-label': 'حقيبة التسوق', onclick: openCart}, svgEl(CART_SVG), cartBadge);
      return b;
    })()));
  var base = waBase();
  var hero = el('section', {class: 'hero', id: 'home'}, el('div', {class: 'wrap hero-grid'},
    el('div', {}, el('div', {class: 'kicker', text: 'اختاري بريقك اليوم'}),
      el('h1', {text: s.tagline || 'SERA accessories'}),
      s.heroText ? el('p', {class: 'lead', text: s.heroText}) : null,
      el('div', {class: 'btns'}, el('a', {class: 'btn', href: '#products', text: 'تسوّقي التشكيلة'}),
        base ? el('a', {class: 'btn alt', href: base, target: '_blank', rel: 'noopener', text: 'كلّمينا على واتساب'}) : null)),
    el('div', {class: 'hero-logo'}, logo('logo-white.svg', 'SERA accessories'))));
  var products = el('section', {class: 'section soft', id: 'products'}, el('div', {class: 'wrap'},
    el('div', {class: 'eyebrow', text: 'NEW ARRIVALS'}), el('h2', {text: 'تشكيلة مختارة ليكِ'}),
    el('div', {class: 'tools'},
      el('div', {class: 'search'}, svgEl(SEARCH_SVG), el('input', {type: 'text', id: 'q', placeholder: 'دوّري على قطعة', value: query, autocomplete: 'off', 'aria-label': 'بحث في المنتجات', oninput: function(e){ query = e.target.value; renderGrid(); }})),
      el('div', {class: 'chips', id: 'chips', role: 'group', 'aria-label': 'الأقسام'})),
    el('ul', {class: 'grid', id: 'grid'}),
    el('div', {class: 'empty', id: 'empty', hidden: true})));
  var promo = el('section', {class: 'section', id: 'about'}, el('div', {class: 'wrap'}, el('div', {class: 'promo'},
    el('div', {class: 'promo-copy'}, el('div', {class: 'eyebrow', text: 'A GIFT FROM THE HEART'}), el('h2', {text: 'تفاصيل صغيرة، أثر كبير'}),
      el('p', {text: 'اختاري قطعة تحكي حكايتك، أو قدّميها هدية تفضل قريبة من القلب.'}),
      el('div', {}, el('a', {class: 'btn', href: '#products', text: 'اختاري هديتك'}))),
    el('div', {class: 'promo-art'}, logo('logo-white.svg', '')))));
  var links = [];
  if (base) links.push(el('a', {href: base, target: '_blank', rel: 'noopener', text: 'اطلبي عبر واتساب'}));
  if (s.instagram) links.push(el('a', {href: 'https://instagram.com/' + encodeURIComponent(s.instagram), target: '_blank', rel: 'noopener', text: 'إنستجرام'}));
  var foot = el('footer', {class: 'footer'}, el('div', {class: 'wrap'},
    el('div', {class: 'fgrid'},
      el('div', {}, el('div', {class: 'brand'}, logo('logo-gold-light.svg', 'SERA accessories')), el('p', {class: 'fnote', text: 'إكسسوارات يومية بلمسة ناعمة، لتكمّل كل تفاصيلك الجميلة.'})),
      el('div', {}, el('h3', {text: 'تسوّقي'}), el('nav', {class: 'flinks'}, el('a', {href: '#products', text: 'المنتجات'}), el('a', {href: '#about', text: 'الهدايا'}))),
      el('div', {}, el('h3', {text: 'تواصلي معانا'}), el('nav', {class: 'flinks'}, links,
        s.whatsapp ? el('span', {style: 'font-size:.8125rem;color:#EEE0DA'}, 'واتساب: ', el('span', {class: 'num', text: '+' + s.whatsapp})) : null))),
    el('div', {class: 'fbase'}, el('span', {text: '© 2026 SERA accessories — كل الحقوق محفوظة'}),
      s.instagram ? el('span', {class: 'num', text: '@' + s.instagram}) : null)));
  var shell = el('div', {class: 'shell'});
  if (s.banner) shell.append(el('div', {class: 'strip', text: s.banner}));
  shell.append(head, hero, products, promo, foot);
  app.append(shell);
  renderGrid();
  updateCart();
  route();
}

async function loadRemote(){
  if (!remoteEnabled) return render();
  try {
    var settingsRes = await sb.from('site_settings').select('key,value');
    if (!settingsRes.error && settingsRes.data) settingsRes.data.forEach(function(row){ state.settings[row.key] = row.value; });
    var productsRes = await sb.from('products').select('*').order('created_at', {ascending:true});
    if (!productsRes.error && productsRes.data && productsRes.data.length) state.products = productsRes.data.map(function(p){ var im = (p.images && p.images.length) ? p.images : (p.image_url ? [p.image_url] : []); return {id:p.id,name:p.name,cat:p.category,price:p.price,img:im[0] || '',images:im,desc:p.description || '',soldOut:!!p.sold_out,active:p.active !== false}; });
  } catch(e) { console.warn('Remote data unavailable; using local defaults.', e); }
  state.settings.whatsapp = normNum(state.settings.whatsapp);
  render();
}
buildDrawer();
document.body.append(backdrop, drawer);
buildDetail();
loadRemote();
})();
