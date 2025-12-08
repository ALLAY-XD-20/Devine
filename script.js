// --- Mobile Navigation Toggle ---
document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.mobile-nav').classList.toggle('hidden');
});

// --- Dark/Light Mode Toggle ---
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference or set dark mode default
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    themeToggle.textContent = '🌙'; // Moon icon for light mode
} else {
    themeToggle.textContent = '☀️'; // Sun icon for dark mode
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');

    // Update local storage and icon
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙';
    } else {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
    }
});


// --- Animated Statistics Counter ---
// This needs to run only on index.html, so we wrap it in a check.
if (document.querySelector('.stats-section')) {
    const statItems = document.querySelectorAll('.stat-number');
    const duration = 2000; // 2 seconds

    // Function to animate a single counter
    function animateCounter(item) {
        const targetCount = parseFloat(item.getAttribute('data-count'));
        const suffix = item.getAttribute('data-suffix');
        const isDecimal = targetCount % 1 !== 0;

        let start = 0;
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            let current = progress * targetCount;

            if (isDecimal) {
                // Special handling for 99.99%
                item.textContent = current.toFixed(2) + suffix;
            } else {
                // General integer handling
                item.textContent = Math.floor(current).toLocaleString() + suffix;
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Ensure the final value is exactly the target
                item.textContent = targetCount.toLocaleString(undefined, {
                    minimumFractionDigits: isDecimal ? 2 : 0,
                    maximumFractionDigits: isDecimal ? 2 : 0
                }) + suffix;
            }
        };

        window.requestAnimationFrame(step);
    }

    // Intersection Observer to trigger animation when visible
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% of the element is visible

    statItems.forEach(item => {
        observer.observe(item);
    });
}


// --- Copy Link & Toast Notification Logic ---
const copyButtons = document.querySelectorAll('.copy-link-btn');
const toast = document.getElementById('toast');

function showToast(message) {
    // If the toast element doesn't exist (e.g., on pages without .copy-link-btn), skip.
    if (!toast) return; 

    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        // Give time for fade out before hiding completely
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Add copy functionality to all buttons with class .copy-link-btn
copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const linkToCopy = button.getAttribute('data-link');
        const isEmail = button.getAttribute('data-type') === 'email';

        // Check if browser supports clipboard API, otherwise use legacy method
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(linkToCopy);
                const type = isEmail ? 'Email' : 'Link';
                const message = `${type} copied to clipboard!`;
                showToast(message);
            } catch (err) {
                console.error('Failed to copy text using modern API:', err);
                showToast('Failed to copy. Please copy manually.');
            }
        } else {
            // Fallback for older browsers (less reliable, but better than nothing)
            try {
                const tempInput = document.createElement('textarea');
                tempInput.value = linkToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                const type = isEmail ? 'Email' : 'Link';
                const message = `${type} copied to clipboard (Fallback)!`;
                showToast(message);
            } catch (err) {
                console.error('Failed to copy text using fallback:', err);
                showToast('Failed to copy. Please copy manually.');
            }
        }
    });
});