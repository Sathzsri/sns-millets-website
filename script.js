function initializeWebsite() {

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
        // Replace dashes with slashes for cross-browser parsing (e.g. Safari compatibility)
        const publishDate = new Date(publishDateStr.replace(/-/g, '/'));
        const currentDate = new Date();
        
        let daysSince = Math.max(0, (currentDate - publishDate) / (1000 * 60 * 60 * 24));
        
        // Deterministic hash based on blogId
        let hash = 0;
        for (let i = 0; i < blogId.length; i++) {
            hash = blogId.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        
        // Seeding parameters: average daily views and initial offset calibrated to < 600 views max cap
        const maxCap = 400 + (hash % 200); // 400 to 599 max cap
        const initialViews = 15 + (hash % 30); // 15 to 44 initial views (starts small for organic feel)
        const dailyViewsRate = 1.0 + ((hash % 10) / 10); // 1.0 to 1.9 views per day
        
        let calculatedViews = Math.floor(initialViews + (daysSince * dailyViewsRate));
        if (calculatedViews > maxCap) {
            calculatedViews = maxCap;
        }
        
        const storageKey = `views_blog_${blogId}`;
        let storedViews = localStorage.getItem(storageKey);
        
        if (storedViews) {
            storedViews = parseInt(storedViews, 10);
            // Overwrite stored views if they exceed the new maxCap or are lagging calculated views
            if (storedViews > maxCap || calculatedViews > storedViews) {
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

    // Initialize Bootstrap Tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Multi-Step Form Logic
    let currentStep = 1;
    const totalSteps = 3;

    window.nextStep = function(step) {
        // Validation for step 1
        if (step === 2 && currentStep === 1) {
            // Check if at least one crop is selected
            const checkedCrops = document.querySelectorAll('input[name="crops"]:checked');
            if (checkedCrops.length === 0) {
                alert('Please select at least one crop before proceeding.');
                return;
            }
        }
        // Validation for step 2
        if (step === 3 && currentStep === 2) {
            const port = document.getElementById('destination_port');
            if (!port.value.trim()) {
                alert('Please specify the destination port and country.');
                port.focus();
                return;
            }
        }

        // Hide current step, show target step
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.getElementById(`step${step}`).classList.add('active');

        // Update step dots
        document.getElementById(`dot${currentStep}`).classList.remove('active');
        if (step > currentStep) {
            document.getElementById(`dot${currentStep}`).classList.add('completed');
        }
        document.getElementById(`dot${step}`).classList.add('active');

        // Update progress bar
        const progressPercentage = ((step - 1) / (totalSteps - 1)) * 84; // 84% width max cap
        document.getElementById('stepProgressBar').style.width = `${progressPercentage}%`;

        currentStep = step;
    };

    window.prevStep = function(step) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.getElementById(`step${step}`).classList.add('active');

        document.getElementById(`dot${currentStep}`).classList.remove('active');
        document.getElementById(`dot${step}`).classList.remove('completed');
        document.getElementById(`dot${step}`).classList.add('active');

        const progressPercentage = ((step - 1) / (totalSteps - 1)) * 84;
        document.getElementById('stepProgressBar').style.width = `${progressPercentage}%`;

        currentStep = step;
    };

    // Form compilation logic on submit
    const quoteForm = document.getElementById('b2bQuoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            // Validate step 3 fields
            const buyerName = document.getElementById('buyer_name').value.trim();
            const buyerEmail = document.getElementById('buyer_email').value.trim();
            const buyerCompany = document.getElementById('buyer_company').value.trim();
            const buyerPhone = document.getElementById('buyer_phone').value.trim();
            const buyerNotes = document.getElementById('buyer_notes').value.trim();

            if (!buyerName || !buyerEmail || !buyerCompany || !buyerPhone) {
                alert('Please fill in all the required fields in Step 3.');
                e.preventDefault();
                return;
            }

            // Gather values
            const selectedCrops = Array.from(document.querySelectorAll('input[name="crops"]:checked')).map(el => el.value).join(', ');
            const purityGrade = document.querySelector('input[name="purity_grade"]:checked').value;
            const volume = document.getElementById('order_volume').value;
            const packaging = document.getElementById('order_packing').value;
            const port = document.getElementById('destination_port').value;
            const incoterm = document.getElementById('incoterm').value;

            // Assemble compiled message
            const compiledMsg = `B2B IMPORT INQUIRY DETAILS:
-------------------------------------------
Name: ${buyerName}
Email: ${buyerEmail}
Company: ${buyerCompany}
Phone / WhatsApp: ${buyerPhone}
-------------------------------------------
Sourcing Crop(s): ${selectedCrops}
Processing Grade: ${purityGrade}
Target Sourcing Volume: ${volume}
Packaging Request: ${packaging}
Incoterms: ${incoterm}
Destination Port: ${port}
-------------------------------------------
Specific Instructions / Notes:
${buyerNotes || "None provided"}
`;

            document.getElementById('compiledMessage').value = compiledMsg;
        });
    }

    // Connect Product Spec Buttons to form auto-population
    document.querySelectorAll('.get-specs-quote-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const milletName = this.getAttribute('data-millet');
            
            // Clear current crop checkboxes
            document.querySelectorAll('input[name="crops"]').forEach(cb => {
                cb.checked = false;
            });

            // Find checkbox for this crop and check it
            let targetCheckbox = null;
            if (milletName.includes('Finger')) targetCheckbox = document.getElementById('crop_finger');
            else if (milletName.includes('Pearl')) targetCheckbox = document.getElementById('crop_pearl');
            else if (milletName.includes('Foxtail')) targetCheckbox = document.getElementById('crop_foxtail');
            else if (milletName.includes('Kodo')) targetCheckbox = document.getElementById('crop_kodo');
            else if (milletName.includes('Barnyard')) targetCheckbox = document.getElementById('crop_barnyard');
            else if (milletName.includes('Browntop')) targetCheckbox = document.getElementById('crop_browntop');

            if (targetCheckbox) {
                targetCheckbox.checked = true;
            }

            // Scroll to form smoothly
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // Reset form steps to Step 1 and advance to Step 2
            currentStep = 1;
            document.querySelectorAll('.form-step').forEach((el, index) => {
                if (index === 0) el.classList.add('active');
                else el.classList.remove('active');
            });
            document.querySelectorAll('.step-dot').forEach((el, index) => {
                if (index === 0) {
                    el.classList.add('active');
                    el.classList.remove('completed');
                } else {
                    el.classList.remove('active', 'completed');
                }
            });
            document.getElementById('stepProgressBar').style.width = '0%';

            // Instantly transition to step 2 after selecting
            setTimeout(() => {
                nextStep(2);
            }, 300);
        });
    });

    // Run views population
    populateViews();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
    initializeWebsite();
}
