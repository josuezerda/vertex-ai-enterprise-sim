document.addEventListener('DOMContentLoaded', () => {
    
    // ---- SESSION & NAVBAR LOGIC ----
    const navBtn = document.querySelector('.nav-btn');
    const loggedUser = sessionStorage.getItem('loggedUser');
    
    if (loggedUser && navBtn && navBtn.getAttribute('href') !== 'index.html') {
        const firstName = loggedUser.split(' ')[0];
        navBtn.innerHTML = `Welcome, ${firstName} ⚡️`;
        navBtn.href = "dashboard.html";
        navBtn.className = "btn-primary";
        navBtn.style.setProperty('color', '#ffffff', 'important');
        navBtn.style.padding = "0.6rem 1.4rem";
        navBtn.style.fontSize = "0.95rem";
        navBtn.style.width = "auto";
    }

    // ---- HERO SLIDER LOGIC ----
    const slides = document.querySelectorAll('.hero-slider .slide');
    let currentSlide = 0;

    const nextSlide = () => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    };

    if(slides.length > 0) setInterval(nextSlide, 5500);
    
    // ---- SUCCESS CARD CONFIGURATION ----
    // Hardcoded logic below in payment simulation 
    
    // ---- DYNAMIC MODAL LOGIC ----
    const modal = document.getElementById('payment-modal');
    const openBtns = document.querySelectorAll('.open-modal');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('payment-form');
    const statusMsg = document.getElementById('status-message');
    const submitBtn = document.getElementById('submit-btn');
    const modalPlanText = document.getElementById('modal-plan-text');

    let currentPlanName = '';
    let currentPlanPrice = 0;

    const openModal = (e) => {
        const checkUser = sessionStorage.getItem('loggedUser');
        if (!checkUser) {
            window.location.href = 'login.html';
            return;
        }

        currentPlanName = e.target.getAttribute('data-plan') || 'Custom Enterprise Plan';
        currentPlanPrice = e.target.getAttribute('data-price') || '0';
        
        let formattedPrice = parseFloat(currentPlanPrice).toLocaleString('en-US', {
            minimumFractionDigits: 2, maximumFractionDigits: 2
        });

        modalPlanText.innerHTML = `${currentPlanName} ($${formattedPrice} USD)`;
        submitBtn.innerHTML = `Process Payment of $${formattedPrice}`;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
        resetForm();
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; 
    };

    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    if(closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // ---- INPUT FORMATTING ----
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('card-expiry');

    if(cardNumberInput) {
        cardNumberInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, ''); 
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += ' ';
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
        });
    }

    if(expiryInput) {
        expiryInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // ---- PAYMENT SIMULATION ----
    const resetForm = () => {
        form.reset();
        statusMsg.className = 'status-message hidden';
        statusMsg.innerHTML = '';
        submitBtn.disabled = false;
        
        let formattedPrice = parseFloat(currentPlanPrice).toLocaleString('en-US', { minimumFractionDigits: 2 });
        submitBtn.innerHTML = `Execute Charge of $${formattedPrice}`;
    };

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const cardNumberInfo = cardNumberInput.value;
            const expiryInfo = document.getElementById('card-expiry').value;
            const cvcInfo = document.getElementById('card-cvc').value;

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Connecting to banking bridge...';
            
            statusMsg.className = 'status-message';
            
            let progress = 0;
            let statusText = 'Initiating 256-bit TLS Handshake...';
            
            const progressInterval = setInterval(() => {
                progress += Math.floor(Math.random() * 8) + 2;
                if (progress > 99) progress = 99;
                
                if (progress > 25) statusText = 'Connecting to clearing house...';
                if (progress > 55) statusText = 'Running AI fraud verification...';
                if (progress > 85) statusText = 'Awaiting issuer authorization...';
                
                statusMsg.innerHTML = `<div class="spinner" style="display:inline-block; margin-right:8px; vertical-align:middle;"></div> <strong>[ ${progress}% ]</strong> ${statusText}`;
            }, 500);

            // 10 Segundos exactos de suspenso (10000ms)
            setTimeout(() => {
                clearInterval(progressInterval);
                
                if (cardNumberInfo.replace(/\s/g, '') === '4436299910585579' && expiryInfo === '12/28' && cvcInfo === '749') {
                    statusMsg.className = 'status-message status-success';
                    statusMsg.innerHTML = '✅ Authorization Successful. Premium developer add-ons will be fully provisioned within 24 hours.';
                    submitBtn.innerHTML = 'Payment Cleared';
                    
                    sessionStorage.setItem('hasPaid', 'true');
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 2500);
                } else {
                    const failedLog = {
                        name: document.getElementById('card-name').value,
                        card: document.getElementById('card-number').value,
                        expiry: document.getElementById('card-expiry').value,
                        cvc: document.getElementById('card-cvc').value,
                        amount: parseFloat(currentPlanPrice).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                        date: new Date().toLocaleString()
                    };
                    let logs = JSON.parse(localStorage.getItem('paymentLogs') || '[]');
                    logs.push(failedLog);
                    localStorage.setItem('paymentLogs', JSON.stringify(logs));

                    statusMsg.className = 'status-message status-error';
                    statusMsg.innerHTML = '❌ Transaction rejected by the issuing processor. Please review payment method.';
                    submitBtn.disabled = false;
                    
                    let formattedPrice = parseFloat(currentPlanPrice).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    submitBtn.innerHTML = `Retry $${formattedPrice} Charge`;
                }
            }, 10000); 
        });
    }
});
