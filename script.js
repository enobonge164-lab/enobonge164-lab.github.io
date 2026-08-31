// ================= WELCOME MESSAGE =================

console.log("Welcome to Sirwhite The Polymath");


// ================= SMOOTH BUTTON HOVER =================

document.querySelectorAll("a").forEach(link => {

    link.addEventListener("mouseenter", () => {
        link.style.transform = "scale(1.05)";
    });

    link.addEventListener("mouseleave", () => {
        link.style.transform = "scale(1)";
    });

});


// ================= COPYRIGHT =================
// Copyright is already inside index.html.
// DO NOT add another copyright here.


// ================= SCROLL REVEAL =================

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

            // Optional: stop observing after animation
            observer.unobserve(entry.target);

        }

    });

}, {
    threshold: 0.1
});


document.querySelectorAll("section, .card").forEach(el => {

    el.classList.add("hidden");

    observer.observe(el);

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

    // Stop safely if typing element doesn't exist
    if (!typingElement) {
        return;
    }

    const currentWord = words[wordIndex];

    if (!isDeleting) {

        typingElement.textContent =
            currentWord.substring(0, letterIndex);

        letterIndex++;

        if (letterIndex > currentWord.length) {

            isDeleting = true;

            setTimeout(type, 1500);

            return;
        }

    } else {

        letterIndex--;

        typingElement.textContent =
            currentWord.substring(0, letterIndex);

        if (letterIndex <= 0) {

            letterIndex = 0;

            isDeleting = false;

            wordIndex =
                (wordIndex + 1) % words.length;

        }

    }

    setTimeout(
        type,
        isDeleting ? 50 : 100
    );

}


type();


// ================= DARK / LIGHT MODE =================

const themeToggle =
    document.getElementById("theme-toggle");


if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");

        if (
            document.body.classList.contains("light-mode")
        ) {

            themeToggle.textContent = "☀️";

            localStorage.setItem(
                "theme",
                "light"
            );

        } else {

            themeToggle.textContent = "🌙";

            localStorage.setItem(
                "theme",
                "dark"
            );

        }

    });


    // Remember user's theme preference

    if (
        localStorage.getItem("theme") === "light"
    ) {

        document.body.classList.add("light-mode");

        themeToggle.textContent = "☀️";

    }

}


// ================= BACK TO TOP =================

const backToTop =
    document.getElementById("backToTop");


if (backToTop) {

    // Hide button when page loads

    backToTop.style.display = "none";


    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            backToTop.style.display = "block";

        } else {

            backToTop.style.display = "none";

        }

    });


    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


// ================= SIMPLE COUNTER =================

function startCounters() {

    const counters =
        document.querySelectorAll(".counter");


    counters.forEach(counter => {

        const target =
            parseInt(counter.dataset.target);


        if (isNaN(target)) {
            return;
        }


        let count = 0;

        const increment =
            Math.max(1, Math.ceil(target / 80));


        const timer =
            setInterval(() => {

                count += increment;


                if (count >= target) {

                    counter.innerText =
                        target;

                    clearInterval(timer);

                } else {

                    counter.innerText =
                        count;

                }

            }, 30);

    });

}


window.addEventListener(
    "load",
    startCounters
);


// ================= HAMBURGER MENU =================

const menuToggle =
    document.getElementById("menu-toggle");

const navMenu =
    document.querySelector(".navbar ul");


if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        navMenu.classList.toggle("active");

    });


    // Close mobile menu when a link is clicked

    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");

        });

    });

}


// ================= NEWSLETTER FORM =================
// Prevent empty form submission for now.
// We can connect this to a real email service during
// the monetisation/production stage.

const newsletterForm =
    document.querySelector("#newsletter form");


if (newsletterForm) {

    newsletterForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const emailInput =
            newsletterForm.querySelector('input[type="email"]');

        if (!emailInput || emailInput.value.trim() === "") {

            alert("Please enter your email address.");

            return;

        }

        alert(
            "Thanks for subscribing! Newsletter integration will be connected soon."
        );

        emailInput.value = "";

    });

}
