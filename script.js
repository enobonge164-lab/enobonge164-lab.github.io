// Welcome Message
console.log("Welcome to Sirwhite The Polymath");
// Smooth Button Hover
document.querySelectorAll("a").forEach(link=>{
link.addEventListener("mouseenter",()=>{
link.style.transform="scale(1.05)";
});

link.addEventListener("mouseleave",()=>{
link.style.transform="scale(1)";
});
});

// Current Year Footer
const footer=document.querySelector("footer");

const year=new Date().getFullYear();

footer.innerHTML += `<p style="margin-top:20px;">© ${year} Sirwhite The Polymath. All Rights Reserved.</p>`;
// Scroll Animation
const hiddenElements = document.querySelectorAll("section, .card");

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
});

hiddenElements.forEach((el) => {
    el.classList.add("hidden");
    scrollObserver.observe(el);
});


// ================= TYPING ANIMATION =================

const words = [
  "AI Builder",
  "Web Developer",
  "Content Creator",
  "Prompt Engineer",
  "Founder of Captivate AI"
];

let wordIndex = 0;
let letterIndex = 0;
let isDeleting = false;

const typingElement = document.getElementById("typing");

function type() {

    const currentWord = words[wordIndex];

    if (!isDeleting) {

        typingElement.textContent =
        currentWord.substring(0, letterIndex++);

        if (letterIndex > currentWord.length) {
            isDeleting = true;
            setTimeout(type, 1500);
            return;
        }

    } else {

        typingElement.textContent =
        currentWord.substring(0, letterIndex--);

        if (letterIndex < 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }

    }

    setTimeout(type, isDeleting ? 50 : 100);

}

type();
// ================= DARK / LIGHT MODE =================

const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        themeToggle.textContent = "☀️";
        localStorage.setItem("theme", "light");
    } else {
        themeToggle.textContent = "🌙";
        localStorage.setItem("theme", "dark");
    }

});

// Remember user preference
if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "☀️";
}
// ================= BACK TO TOP =================

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {
        backToTop.style.display = "block";
    } else {
        backToTop.style.display = "none";
    }

});

backToTop.addEventListener("click", () => {

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

});
// ================= SIMPLE COUNTER =================

function startCounters() {

    const counters = document.querySelectorAll(".counter");

    counters.forEach(counter => {

        const target = parseInt(counter.dataset.target);

        let count = 0;

        const increment = Math.ceil(target / 80);

        const timer = setInterval(() => {

            count += increment;

            if (count >= target) {

                counter.innerText = target;
                clearInterval(timer);

            } else {

                counter.innerText = count;

            }

        }, 30);

    });

}

window.addEventListener("load", startCounters);
// ================= HAMBURGER MENU =================

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.querySelector(".navbar ul");

menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});
