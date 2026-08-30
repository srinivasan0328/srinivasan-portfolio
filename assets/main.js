const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
AOS.init({
    duration: 700,
    once: true,
    offset: 60,
    disable: reduceMotion
});

// Generate a scatter of twinkling stars for the galaxy effect (How I Work section)
(function makeStars() {
    const holder = document.getElementById('twinkleStars');
    if (!holder) return;
    const count = 26;
    for (let i = 0; i < count; i++) {
        const s = document.createElement('span');
        s.className = 'twinkle-star';
        const size = (Math.random() * 2 + 1.2).toFixed(1); // 1.2px – 3.2px
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.left = (Math.random() * 100).toFixed(1) + '%';
        s.style.top = (Math.random() * 100).toFixed(1) + '%';
        s.style.animationDuration = (2.4 + Math.random() * 3).toFixed(1) + 's';
        s.style.animationDelay = (Math.random() * 3).toFixed(1) + 's';
        if (reduceMotion) s.style.animation = 'none';
        holder.appendChild(s);
    }
})();

// Sequential letter-by-letter typing effect across both lines of the hero name
(function typeFullName() {
    const firstEl = document.getElementById('typedFirst');
    const lastEl = document.getElementById('typedLast');
    const cursorA = document.getElementById('cursorA');
    const cursorB = document.getElementById('cursorB');
    if (!firstEl || !lastEl) return;
    const first = "Srinivasan",
        last = "Ravichandran";

    if (reduceMotion) {
        firstEl.textContent = first;
        lastEl.textContent = last;
        cursorA.style.display = 'none';
        cursorB.style.display = 'inline-block';
        return;
    }

    let i = 0;

    function typeFirst() {
        firstEl.textContent = first.slice(0, i);
        i++;
        if (i <= first.length) {
            setTimeout(typeFirst, 90);
        } else {
            cursorA.style.display = 'none';
            cursorB.style.display = 'inline-block';
            setTimeout(typeLastStart, 250);
        }
    }

    function typeLastStart() {
        let j = 0;

        function typeLast() {
            lastEl.textContent = last.slice(0, j);
            j++;
            if (j <= last.length) setTimeout(typeLast, 90);
        }
        typeLast();
    }
    setTimeout(typeFirst, 450); // start after the hero fade-in
})();

// Active nav link on scroll — deterministic, based on section offsets (no flaky band races)
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-link-custom');

function updateActiveNav() {
    const scrollPos = window.scrollY + 140; // account for fixed navbar height + buffer
    let currentId = sections.length ? sections[0].id : '';
    sections.forEach(sec => {
        if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${currentId}`);
    });
}

// Navbar glass background + scroll-top button visibility (single scroll listener)
const nav = document.getElementById('mainNav');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    scrollTopBtn.classList.toggle('show', y > 420);
    updateActiveNav();
};
document.addEventListener('scroll', onScroll);
onScroll();

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
    });
});

// Close mobile menu on link click
document.querySelectorAll('#navMenu .nav-link-custom, #navMenu .btn-nav-cta').forEach(link => {
    link.addEventListener('click', () => {
        const menu = document.getElementById('navMenu');
        if (menu.classList.contains('show')) new bootstrap.Collapse(menu).hide();
    });
});

document.getElementById('year').textContent = new Date().getFullYear();

// Gallery category filter
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryItems.forEach(item => {
            const cats = (item.dataset.category || '').split(' ');
            const show = filter === 'all' || cats.includes(filter);
            item.classList.toggle('hide', !show);
        });
    });
});

/* ============ CONTACT FORM: validation + real email delivery ============
   Uses FormSubmit.co — free, no signup, no access key needed.
   IMPORTANT ONE-TIME STEP: the FIRST time this form is submitted,
   FormSubmit sends a confirmation email to srinivasanakash0328@gmail.com.
   Click "Activate Form" in that email once — after that, every future
   submission lands directly in the inbox automatically.
============================================================ */
const RECEIVER_EMAIL = "srinivasanakash0328@gmail.com";

const form = document.getElementById('contactForm');
const btn = document.getElementById('submitBtn');
const btnText = document.getElementById('submitBtnText');
const status = document.getElementById('formStatus');
const fields = ['fName', 'fEmail', 'fSubject', 'fMessage'].map(id => document.getElementById(id));

function validateField(field) {
    const valid = field.checkValidity();
    field.classList.toggle('is-invalid', !valid);
    return valid;
}

fields.forEach(f => {
    f.addEventListener('input', () => {
        if (form.classList.contains('was-validated-custom')) validateField(f);
    });
    f.addEventListener('blur', () => validateField(f));
});

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    form.classList.add('was-validated-custom');

    const allValid = fields.map(validateField).every(Boolean);
    if (!allValid) {
        status.style.color = "#FFD9D9";
        status.textContent = "Please fix the highlighted fields above.";
        return;
    }

    // Honeypot spam check
    if (form.querySelector('[name="_honey"]').value) return;

    const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim(),
        _subject: "New portfolio inquiry — srinivasan.dev",
        _template: "table",
        _captcha: "false"
    };

    btn.disabled = true;
    btnText.textContent = "Sending...";
    status.style.color = "";
    status.textContent = "";

    try {
        const res = await fetch(`https://formsubmit.co/ajax/${RECEIVER_EMAIL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && (data.success === "true" || data.success === true)) {
            status.style.color = "#A7F3D0";
            status.textContent = "✓ Message sent — thanks! I'll get back to you soon.";
            form.reset();
            form.classList.remove('was-validated-custom');
            fields.forEach(f => f.classList.remove('is-invalid'));
        } else {
            throw new Error(data.message || "Send failed");
        }
    } catch (err) {
        status.style.color = "#FCA5A5";
        status.textContent = "✗ First-time setup: check " + RECEIVER_EMAIL + " and click the FormSubmit activation link, then try again.";
    } finally {
        btn.disabled = false;
        btnText.textContent = "Send Message";
    }
});