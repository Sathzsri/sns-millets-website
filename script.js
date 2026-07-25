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

                // Stop the timer if the user interacts with the modal at all
                let isTimerStopped = false;
                const stopTimer = () => {
                    if (isTimerStopped) return;
                    isTimerStopped = true;
                    clearInterval(timerInterval);
                    if (timerContainer) {
                        timerContainer.innerHTML = '<span class="text-primary-theme fw-bold">Take your time filling out the form!</span>';
                    }
                };

                // Add robust listeners directly to the content and form areas
                const modalContent = popupModalEl.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.addEventListener('mouseenter', stopTimer);
                    modalContent.addEventListener('click', stopTimer);
                    modalContent.addEventListener('touchstart', stopTimer);
                    modalContent.addEventListener('keydown', stopTimer);
                    modalContent.addEventListener('focusin', stopTimer);
                }

                // Add specifically to inputs just to be absolutely certain
                const inputs = popupModalEl.querySelectorAll('input, button');
                inputs.forEach(input => {
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

    // Custom Google Translate Dropdown Logic
    const langButtons = document.querySelectorAll('.custom-lang-btn');
    const currentLangSpan = document.getElementById('current-lang');

    langButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const langCode = this.getAttribute('data-lang');
            const langName = this.innerText.trim();

            // Update Custom UI Name
            if (currentLangSpan) currentLangSpan.innerText = langName;

            // Trigger actual Google Translate dropdown
            const googleSelect = document.querySelector('.goog-te-combo');
            if (googleSelect) {
                googleSelect.value = langCode;
                // Google requires both change and built-in dispatch
                googleSelect.dispatchEvent(new Event('change'));
            } else {
                // Fallback: If google script isn't fully loaded, force via cookie and reload
                document.cookie = `googtrans=/en/${langCode}; path=/`;
                document.cookie = `googtrans=/en/${langCode}; domain=.${location.hostname}; path=/`;
                window.location.reload();
            }
        });
    });

    // Check existing Google Translate cookie to persist the custom UI name
    setTimeout(() => {
        const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
        if (match && currentLangSpan) {
            const currentLangVal = match[1].split('/')[2]; // Extract target language code
            if (currentLangVal) {
                const activeBtn = document.querySelector(`.custom-lang-btn[data-lang="${currentLangVal}"]`);
                if (activeBtn) {
                    currentLangSpan.innerText = activeBtn.innerText.trim();
                }
            }
        }
    }, 1000); // Wait 1 second for Google to init

    // --- Dynamic Realistic View Counter Logic ---
    function getBlogViews(blogId, publishDateStr) {
        if (!blogId || !publishDateStr) return 0;
        const publishDate = new Date(publishDateStr);
        const currentDate = new Date();
        
        let daysSince = Math.max(0, (currentDate - publishDate) / (1000 * 60 * 60 * 24));
        
        // Deterministic hash based on blogId
        let hash = 0;
        for (let i = 0; i < blogId.length; i++) {
            hash = blogId.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        
        // Seeding parameters: average daily views and initial offset
        const dailyViewsRate = 3 + (hash % 8); // 3 to 10 views per day
        const initialViews = 150 + (hash % 350); // 150 to 500 initial views
        
        let calculatedViews = Math.floor(initialViews + (daysSince * dailyViewsRate));
        
        const storageKey = `views_blog_${blogId}`;
        let storedViews = localStorage.getItem(storageKey);
        
        if (storedViews) {
            storedViews = parseInt(storedViews, 10);
            if (calculatedViews > storedViews) {
                localStorage.setItem(storageKey, calculatedViews);
                storedViews = calculatedViews;
            }
        } else {
            localStorage.setItem(storageKey, calculatedViews);
            storedViews = calculatedViews;
        }
        
        // Increment once per session
        const sessionKey = `visited_blog_${blogId}`;
        if (!sessionStorage.getItem(sessionKey)) {
            storedViews += 1;
            localStorage.setItem(storageKey, storedViews);
            sessionStorage.setItem(sessionKey, 'true');
        }
        
        return storedViews;
    }

    function getSiteViews() {
        const startDate = new Date('2021-03-15'); // Company inception (approximate date)
        const currentDate = new Date();
        
        let daysSince = Math.max(0, (currentDate - startDate) / (1000 * 60 * 60 * 24));
        
        // Deterministic average daily visitor rate
        const dailyVisitsRate = 82; // 82 visits per day
        const baseSiteViews = Math.floor(25400 + (daysSince * dailyVisitsRate));
        
        const storageKey = 'views_site_total';
        let storedSiteViews = localStorage.getItem(storageKey);
        
        if (storedSiteViews) {
            storedSiteViews = parseInt(storedSiteViews, 10);
            if (baseSiteViews > storedSiteViews) {
                localStorage.setItem(storageKey, baseSiteViews);
                storedSiteViews = baseSiteViews;
            }
        } else {
            localStorage.setItem(storageKey, baseSiteViews);
            storedSiteViews = baseSiteViews;
        }
        
        // Increment once per session
        const sessionKey = 'visited_site_session';
        if (!sessionStorage.getItem(sessionKey)) {
            storedSiteViews += 1;
            localStorage.setItem(storageKey, storedSiteViews);
            sessionStorage.setItem(sessionKey, 'true');
        }
        
        return storedSiteViews;
    }

    // Populate the view elements on the page
    function populateViews() {
        // Blog views
        const blogViewElements = document.querySelectorAll('.blog-views');
        blogViewElements.forEach(el => {
            const blogId = el.getAttribute('data-blog-id');
            const publishDateStr = el.getAttribute('data-publish-date');
            if (blogId && publishDateStr) {
                const viewsCount = getBlogViews(blogId, publishDateStr);
                el.innerText = viewsCount.toLocaleString();
            }
        });

        // Site total views
        const siteViewsElement = document.getElementById('site-views');
        if (siteViewsElement) {
            const siteViewsCount = getSiteViews();
            siteViewsElement.innerText = siteViewsCount.toLocaleString();
        }
    }

    // Run views population
    populateViews();
});
