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
