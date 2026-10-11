const ADMIN_EMAIL = "sngoatfarm9718602741@gmail.com";

// EmailJS Configuration Keys
const EMAILJS_SERVICE_ID = "service_x2ye63e";
const EMAILJS_TEMPLATE_ID = "template_pheh7l5";
const EMAILJS_PUBLIC_KEY = "LOE-hw0xg-2mOlmQG";

let generatedOTP = "";
let pendingUserEmail = "";

// Initialize EmailJS
(function() {
    emailjs.init(EMAILJS_PUBLIC_KEY);
})();

// Send 6-digit OTP to user's real Gmail address with expiration time
function sendOTP() {
    const emailInput = document.getElementById('userEmailInput').value.trim();
    if (!emailInput || !emailInput.includes('@')) {
        alert("Please enter a valid Gmail address.");
        return;
    }

    const sendBtn = document.getElementById('sendOtpBtn');
    sendBtn.innerText = "Sending Code...";
    sendBtn.disabled = true;

    pendingUserEmail = emailInput;
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiration time (15 minutes from now)
    const expiryTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Parameters matching template_pheh7l5 variables (to_email, otp_code, time)
    const templateParams = {
        to_email: pendingUserEmail,
        otp_code: generatedOTP,
        time: expiryTime
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            document.getElementById('targetEmailSpan').innerText = pendingUserEmail;
            document.getElementById('step-email').style.display = 'none';
            document.getElementById('step-otp').style.display = 'block';
            alert(`A 6-digit verification code has been sent directly to ${pendingUserEmail}! Check your Gmail inbox/spam.`);
        }, function(error) {
            console.error("EmailJS Error:", error);
            sendBtn.innerText = "Send Verification Code";
            sendBtn.disabled = false;
            alert("Failed to send email. Please check your EmailJS Public Key configuration.");
        });
}

// Auto-focus move between OTP inputs + Paste Support
function moveOtpFocus(field, index) {
    const fields = document.querySelectorAll('.otp-field');
    if (field.value.length === 1 && index < 5) {
        fields[index + 1].focus();
    }
}

// Setup Paste and Backspace functionality for OTP inputs once DOM loads
document.addEventListener("DOMContentLoaded", function () {
    const otpFields = document.querySelectorAll('.otp-field');
    
    otpFields.forEach((field, index) => {
        field.addEventListener('paste', function (e) {
            e.preventDefault();
            const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim();
            
            if (/^\d{6}$/.test(pastedData)) {
                const digits = pastedData.split('');
                otpFields.forEach((input, i) => {
                    input.value = digits[i] || '';
                });
                otpFields[5].focus();
            }
        });

        field.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && !field.value && index > 0) {
                otpFields[index - 1].focus();
            }
        });
    });

    checkExistingVerification();
});

// Verify OTP & Grant Entry
function verifyOTP() {
    const fields = document.querySelectorAll('.otp-field');
    let enteredCode = "";
    fields.forEach(f => enteredCode += f.value);

    if (enteredCode === generatedOTP && generatedOTP !== "") {
        document.getElementById('verification-modal').style.display = 'none';
        
        const userName = pendingUserEmail.split('@')[0];
        localStorage.setItem('verified_user_email', pendingUserEmail);
        localStorage.setItem('verified_user_name', userName);

        setupLoggedInUser(pendingUserEmail, userName);
        trackVisits();
    } else {
        alert("Incorrect 6-digit verification code! Please check your Gmail inbox and try again.");
    }
}

function setupLoggedInUser(email, name) {
    document.getElementById('user-profile').style.display = 'flex';
    document.getElementById('user-name').innerText = name;
    document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`;

    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        document.getElementById('admin-banner').style.display = 'block';
    } else {
        document.getElementById('admin-banner').style.display = 'none';
    }
}

function signOut() {
    localStorage.removeItem('verified_user_email');
    localStorage.removeItem('verified_user_name');
    location.reload();
}

function checkExistingVerification() {
    const savedEmail = localStorage.getItem('verified_user_email');
    const savedName = localStorage.getItem('verified_user_name');

    if (savedEmail && savedName) {
        document.getElementById('verification-modal').style.display = 'none';
        setupLoggedInUser(savedEmail, savedName);
        trackVisits();
    }
}

function trackVisits() {
    let currentVisits = localStorage.getItem('sn_farm_visits');
    if (!currentVisits) {
        currentVisits = 1;
    } else {
        currentVisits = parseInt(currentVisits) + 1;
    }
    localStorage.setItem('sn_farm_visits', currentVisits);
    document.getElementById('visit-count-display').innerText = currentVisits;
}

function submitReview(e) {
    e.preventDefault();
    const name = document.getElementById('reviewerName').value;
    const rating = parseInt(document.getElementById('reviewRating').value);
    const text = document.getElementById('reviewText').value;

    let stars = "⭐".repeat(rating);

    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    reviewCard.innerHTML = `
        <div class="review-header">
            <span>${name}</span>
            <span style="color: #f59e0b;">${stars}</span>
        </div>
        <p>"${text}"</p>
    `;

    document.getElementById('reviewsList').prepend(reviewCard);
    document.getElementById('reviewForm').reset();
    alert("Thank you for your feedback! Your review has been published.");
}

function showHome(sectionId) {
    document.getElementById('home-view').classList.add('active');
    document.getElementById('detail-view').classList.remove('active');
    window.scrollTo(0, 0);
    
    if (sectionId) {
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
}

function showDetail(name, imgArray, breed, price, desc) {
    document.getElementById('home-view').classList.remove('active');
    document.getElementById('detail-view').classList.add('active');
    window.scrollTo(0, 0);

    document.getElementById('detail-name').innerText = name;
    document.getElementById('detail-breed').innerText = breed;
    document.getElementById('detail-price').innerText = "Status / Terms: " + price;
    document.getElementById('detail-desc').innerText = desc;

    const mainImg = document.getElementById('detail-img');
    mainImg.src = imgArray[0];

    const thumbList = document.getElementById('thumbnail-list');
    thumbList.innerHTML = '';

    if (imgArray.length > 1) {
        thumbList.style.display = 'flex';
        imgArray.forEach((imgSrc, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.className = 'thumbnail-img' + (index === 0 ? ' active-thumb' : '');
            thumb.onclick = function() {
                mainImg.src = imgSrc;
                document.querySelectorAll('.thumbnail-img').forEach(t => t.classList.remove('active-thumb'));
                thumb.classList.add('active-thumb');
            };
            thumbList.appendChild(thumb);
        });
    } else {
        thumbList.style.display = 'none';
    }

    const phoneNumber = "9311957686";
    const message = `Hello, I am a Customer inquiring about ${name}. Please share more information.`;
    const encodedMessage = encodeURIComponent(message);
    document.getElementById('whatsapp-link').href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}