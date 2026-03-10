document.addEventListener('DOMContentLoaded', function () {

    // Initialize AOS Animation Library
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 50
    });

    // Navbar shrink function
    var navbarShrink = function () {
        const mainNav = document.body.querySelector('#mainNav');
        if (!mainNav) {
            return;
        }
        if (window.scrollY === 0) {
            mainNav.classList.remove('navbar-shrink');
        } else {
            mainNav.classList.add('navbar-shrink');
        }
    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    }

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Automatic Contact Popup Modal Logic
    const popupModalEl = document.getElementById('contactPopupModal');
    if (popupModalEl) {
        // Only show once per session by checking sessionStorage
        if (!sessionStorage.getItem('contactPopupShown')) {
            const popupModal = new bootstrap.Modal(popupModalEl);

            // Show popup after a short delay (1.5 seconds)
            setTimeout(() => {
                popupModal.show();
                sessionStorage.setItem('contactPopupShown', 'true');

                let timeLeft = 5;
                const timerSpan = document.getElementById('popupTimer');
                const timerContainer = timerSpan ? timerSpan.parentElement : null;

                // Start 5-second countdown
                let timerInterval = setInterval(() => {
                    timeLeft--;
                    if (timerSpan) timerSpan.innerText = timeLeft;

                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        popupModal.hide();
                    }
                }, 1000);

                // Stop the timer if the user clicks or types in the form
                const stopTimer = () => {
                    clearInterval(timerInterval);
                    if (timerContainer) {
                        timerContainer.innerHTML = '<span class="text-primary-theme fw-bold">Take your time filling out the form!</span>';
                    }
                };

                const modalInputs = popupModalEl.querySelectorAll('input, button');
                modalInputs.forEach(input => {
                    input.addEventListener('focus', stopTimer);
                    input.addEventListener('click', stopTimer);
                    input.addEventListener('input', stopTimer);
                });

                // Clear timer if user manually closes the modern popup
                popupModalEl.addEventListener('hidden.bs.modal', function () {
                    clearInterval(timerInterval);
                });

            }, 1500);
        }
    }
});
