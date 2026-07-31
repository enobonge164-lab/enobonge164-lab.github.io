// Welcome Message
console.log("Welcome to Sirwhite The Polymath");

// Fade-in Animation
const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.style.opacity="1";
entry.target.style.transform="translateY(0)";
}
});
});

cards.forEach(card=>{
card.style.opacity="0";
card.style.transform="translateY(40px)";
card.style.transition="0.8s";
observer.observe(card);
});

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

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
});

hiddenElements.forEach((el) => {
    el.classList.add("hidden");
    observer.observe(el);
});
