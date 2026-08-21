/* =========================================================
   LedgersLogic — script.js
   Vanilla JS only. No dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Hero text reveal (word-by-word, on page load) ---------- */
  var heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    var revealEls = heroContent.querySelectorAll("h1, p");
    var wordIndex = 0;

    revealEls.forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      words.forEach(function (word, i) {
        var span = document.createElement("span");
        span.className = "reveal-word";
        span.style.animationDelay = (wordIndex * 0.05) + "s";
        span.textContent = word;
        el.appendChild(span);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
        wordIndex += 1;
      });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      primaryNav.classList.toggle("is-open", !isOpen);
    });

    // Close mobile menu after clicking a normal nav link
    primaryNav.querySelectorAll(".nav-links > li > a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        primaryNav.classList.remove("is-open");
      });
    });
  }

  /* ---------- Services dropdown (tap to open on touch/mobile) ---------- */
  var dropdown = document.querySelector(".has-dropdown");
  if (dropdown) {
    var dropdownToggle = dropdown.querySelector(".dropdown-toggle");
    dropdownToggle.addEventListener("click", function () {
      var isOpen = dropdown.classList.toggle("is-open");
      dropdownToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("is-open");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Region selector (USA / India) ---------- */
  var regionButtons = document.querySelectorAll(".region-btn");
  var servicePanels = document.querySelectorAll(".service-list[data-region-panel]");
  var servicesImage = document.getElementById("servicesImage");
  var servicesImageSwapToken = 0;

  var regionServiceImages = {
    usa: [
      "./assets/services/usservices3.webp",
      "./assets/services/usservices5.webp",
      "./assets/services/usservices4.webp",
      "./assets/services/usservices6.webp",
      "./assets/services/usservices7.webp"
    ],
    india: [
      "./assets/services/indiaservices3.webp",
      "./assets/services/indiaservices4.webp",
      "./assets/services/indiaservices5.webp",
      "./assets/services/indiaservices6.webp",
      "./assets/services/indiaservices7.webp"
    ]
  };

  function updateServicesImage(src, alt) {
    if (!servicesImage || !src) return;
    if (alt) servicesImage.alt = alt;
    if (servicesImage.getAttribute("src") === src) return;

    var swapToken = ++servicesImageSwapToken;
    servicesImage.classList.add("is-fading");

    setTimeout(function () {
      if (swapToken !== servicesImageSwapToken) return;

      function clearFade() {
        if (swapToken !== servicesImageSwapToken) return;
        servicesImage.classList.remove("is-fading");
        servicesImage.removeEventListener("load", clearFade);
        servicesImage.removeEventListener("error", clearFade);
      }

      servicesImage.addEventListener("load", clearFade);
      servicesImage.addEventListener("error", clearFade);
      servicesImage.src = src;

      if (servicesImage.complete) clearFade();
    }, 170);
  }

  function setServicesImageForItem(item, region) {
    if (!servicesImage || !item) return;

    var list = item.closest(".service-list[data-region-panel]");
    if (!list) return;

    var items = Array.prototype.slice.call(list.querySelectorAll(".service-item"));
    var index = items.indexOf(item);
    var mapped = regionServiceImages[region] && regionServiceImages[region][index];
    var titleEl = item.querySelector(".service-item-title");

    if (mapped) {
      updateServicesImage(mapped, titleEl ? titleEl.textContent.trim() + " illustration" : "");
      return;
    }

    var src = servicesImage.dataset[region + "Src"];
    var alt = servicesImage.dataset[region + "Alt"];
    updateServicesImage(src, alt);
  }

  function syncServicesImageToOpenItem(region) {
    var panel = document.querySelector('.service-list[data-region-panel="' + region + '"]');
    if (!panel) return;

    var activeItem = panel.querySelector(".service-item.is-open") || panel.querySelector(".service-item");
    setServicesImageForItem(activeItem, region);
  }

  function setRegion(region) {
    regionButtons.forEach(function (btn) {
      var active = btn.dataset.region === region;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    servicePanels.forEach(function (panel) {
      panel.classList.toggle("is-hidden", panel.dataset.regionPanel !== region);
    });
    syncServicesImageToOpenItem(region);
  }

  regionButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setRegion(btn.dataset.region);
    });
  });

  // Header / footer links that deep-link to a specific region tab
  document.querySelectorAll('a[href="#services"][data-region]').forEach(function (link) {
    link.addEventListener("click", function () {
      setRegion(link.dataset.region);
    });
  });

  /* ---------- Services accordion ---------- */
  var serviceItems = document.querySelectorAll(".service-item");
  serviceItems.forEach(function (item) {
    var toggle = item.querySelector(".service-item-toggle");
    toggle.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");

      // Close sibling items within the same list so only one is open at a time
      var list = item.closest(".service-list");
      if (list) {
        list.querySelectorAll(".service-item.is-open").forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove("is-open");
            openItem.querySelector(".service-item-toggle").setAttribute("aria-expanded", "false");
          }
        });
      }

      item.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));

      if (willOpen) {
        var parentPanel = item.closest(".service-list[data-region-panel]");
        if (parentPanel) setServicesImageForItem(item, parentPanel.dataset.regionPanel);
      }
    });
  });

  var activeRegionBtn = document.querySelector(".region-btn.is-active") || regionButtons[0];
  if (activeRegionBtn) syncServicesImageToOpenItem(activeRegionBtn.dataset.region);

  /* ---------- Contact form validation + submission ---------- */
  // 1) Email notification via EmailJS (emailjs.com) — fill these in from your EmailJS dashboard.
  var EMAILJS_PUBLIC_KEY = "PASTE_YOUR_EMAILJS_PUBLIC_KEY";
  var EMAILJS_SERVICE_ID = "PASTE_YOUR_EMAILJS_SERVICE_ID";
  var EMAILJS_TEMPLATE_ID = "PASTE_YOUR_EMAILJS_TEMPLATE_ID";

  // 2) Row storage in the Google Sheet, via a Google Form linked to that sheet (Form responses ->
  // "Select existing spreadsheet"). Get FORM_ACTION_URL + entry IDs from the form's page source
  // (each field's `name="entry.123456789"` attribute).
  var GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/PASTE_YOUR_FORM_ID/formResponse";
  var GOOGLE_FORM_ENTRY_IDS = {
    name: "entry.PASTE_NAME_ENTRY_ID",
    email: "entry.PASTE_EMAIL_ENTRY_ID",
    message: "entry.PASTE_MESSAGE_ENTRY_ID"
  };

  if (window.emailjs) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  var form = document.getElementById("contactForm");
  if (form) {
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    var messageInput = document.getElementById("message");
    var nameError = document.getElementById("nameError");
    var emailError = document.getElementById("emailError");
    var successMessage = document.getElementById("formSuccess");
    var submitBtn = form.querySelector("button[type=submit]");
    var successText = successMessage.textContent;
    var errorText = "Something went wrong sending your message. Please email us directly at keshav@ledgerslogic.com.";
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateField(input, errorEl, message, isValid) {
      var valid = isValid(input.value.trim());
      input.classList.toggle("is-invalid", !valid);
      errorEl.textContent = valid ? "" : message;
      return valid;
    }

    // Best-effort row storage — Google Forms don't send CORS headers, so the response is opaque
    // (mode: "no-cors") and we can't confirm success/failure client-side from this call alone.
    function saveRowToGoogleSheet(name, email, message) {
      var data = new FormData();
      data.append(GOOGLE_FORM_ENTRY_IDS.name, name);
      data.append(GOOGLE_FORM_ENTRY_IDS.email, email);
      data.append(GOOGLE_FORM_ENTRY_IDS.message, message);
      return fetch(GOOGLE_FORM_ACTION_URL, { method: "POST", mode: "no-cors", body: data });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      successMessage.hidden = true;

      var isNameValid = validateField(nameInput, nameError, "Please enter your name.", function (v) { return v.length > 1; });
      var isEmailValid = validateField(emailInput, emailError, "Please enter a valid email address.", function (v) { return emailPattern.test(v); });

      if (!(isNameValid && isEmailValid)) return;

      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var message = messageInput.value.trim();

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      saveRowToGoogleSheet(name, email, message).catch(function () {});

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { name: name, email: email, message: message })
        .then(function () {
          successMessage.classList.remove("is-error");
          successMessage.textContent = successText;
          successMessage.hidden = false;
          form.reset();
        })
        .catch(function () {
          successMessage.classList.add("is-error");
          successMessage.textContent = errorText;
          successMessage.hidden = false;
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit";
        });
    });

    [nameInput, emailInput].forEach(function (input) {
      input.addEventListener("input", function () {
        input.classList.remove("is-invalid");
      });
    });
  }

  /* ---------- Prompt box typewriter effect ---------- */
  var promptBox = document.getElementById("promptBox");
  var promptTyped = document.getElementById("promptTyped");

  if (promptBox && promptTyped) {
    var fullText = promptTyped.dataset.text || "";
    var hasTyped = false;

    function typePrompt() {
      if (hasTyped) return;
      hasTyped = true;

      var i = 0;
      var typeInterval = window.setInterval(function () {
        i += 1;
        promptTyped.textContent = fullText.slice(0, i);
        if (i >= fullText.length) {
          window.clearInterval(typeInterval);
        }
      }, 18);
    }

    if ("IntersectionObserver" in window) {
      var promptObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            typePrompt();
            promptObserver.disconnect();
          }
        });
      }, { threshold: 0.4 });
      promptObserver.observe(promptBox);
    } else {
      typePrompt();
    }
  }

  /* ---------- Team member modal ---------- */
  var teamModal = document.getElementById("teamModal");
  var teamCards = document.querySelectorAll(".team-card");

  if (teamModal && teamCards.length) {
    var teamData = {
      keshav: {
        name: "Keshav Agrawal",
        photo: "./assets/founder.webp",
        linkedin: "https://www.linkedin.com/in/keshav29/",
        bio: "Keshav has always enjoyed working with numbers—they come naturally to him. He loves helping founders make sense of their finances and turning complicated figures into simple insights they can use. His goal is to make every client feel supported, understood, and confident about their business numbers.",
        achievements: [
          "Managed and reviewed multiple US client engagements at PwC.",
          "Achieved startup breakeven within 12 months of launch by driving operational excellence and financial discipline.",
          "Supported US CPAs in closing accurate, well-structured QBO accounts.",
          "Recognized by PwC Team Leads for outstanding audit efficiency and innovative use of AI tools to optimize Financial Statement line Items."
        ],
        designation: "Founder & CA",
        qualifications: "Chartered Accountant (CA)",
        experience: "6+ Years",
        credentials: [
          "Chartered Accountant (India)",
          "Bachelor of Commerce (Accounting & Finance)",
          "QuickBooks ProAdvisor",
          "Pursuing CPA (US)"
        ],
        experienceList: [
          "2.5 years of post-qualification experience as a Financial Auditor at PwC, working closely with US clients across industries.",
          "Founded and successfully operated a healthcare startup from scratch, gaining hands-on insight into business operations, cash flow, and growth challenges.",
          "Freelanced with US CPAs, assisting with month-end close, QBO cleanup, reconciliations, and ensuring balanced, accurate books."
        ],
        expertise: [
          "QuickBooks Online bookkeeping & review",
          "Financial statement preparation & analysis",
          "Workflow automation setup & optimization",
          "Virtual CFO advisory",
          "Tax Planning & ITR filings for India"
        ]
      },
      praveen: {
        name: "Praveen Agrawal",
        photo: "./assets/cofounder.webp",
        linkedin: "https://www.linkedin.com/in/praveenagrawal89/",
        bio: "Praveen is a \u201chuman of numbers\u201d \u2014 he enjoys working with data and has a natural instinct for financial accuracy. He loves closing tasks quickly and efficiently, with a goal to make every process as simple and clear as possible for clients.",
        achievements: [
          "Secured All India Highest in Strategic Financial Management (SFM) paper.",
          "Designed multiple automation tools to streamline tax and compliance workflows.",
          "Successfully handled clients from varied industries with strong relationship-building and problem-solving skills."
        ],
        designation: "Co-founder & CA",
        qualifications: "Chartered Accountant (CA)",
        experience: "6.5+ Years",
        credentials: [
          "Chartered Accountant (India)",
          "Bachelor of Commerce (Accounting & Finance)"
        ],
        experienceList: [
          "3.5 years of experience, including working with KPMG in the Indirect Taxes practice.",
          "Hands-on exposure across the full spectrum of tax compliances \u2014 Direct Taxes, Indirect Taxes, and related advisory.",
          "Experience in managing GST litigation matters, drafting replies, and supporting clients through assessments and hearings.",
          "Worked with diverse clients across industries, ensuring compliance accuracy and timely execution."
        ],
        expertise: [
          "Accounting & Bookkeeping in Quickbooks & Tally",
          "Financial Statement Preparation & Analysis",
          "SOP design, workflow improvisation & automation",
          "Direct Tax Compliances (Income Tax returns, TDS returns) (India)",
          "Indirect Tax Compliances, Litigation & Advisory (India)",
          "Tax Planning & Advisory (India)"
        ]
      },
      vishakha: {
        name: "Vishakha Agrawal",
        photo: "./assets/cs.webp",
        linkedin: "https://www.linkedin.com/in/vishakha07/",
        bio: "Vishakha is passionate about ensuring businesses stay compliant and navigate the complexities of corporate law. Her meticulous attention to detail and expertise in governance help companies structure themselves for long-term success.",
        achievements: [
          "Secured All India Rank 15th in the CS Executive Examination",
          "Achieved All India Rank 4th in the CS Professional Examination"
        ],
        designation: "Co-Founder & Company Secretary",
        qualifications: "Company Secretary",
        experience: "2 Years",
        credentials: [
          "Company Secretary (CS)",
          "Bachelor of Commerce, NMIMS Mumbai (Distance Learning)",
          "Certification courses in Corporate Governance, Corporate Social Responsibility, Effective Communication, and Human Resource Management"
        ],
        experienceList: [
          "Expertise in Company Law, IBC (Insolvency and Bankruptcy Code), SEBI regulations, and Corporate Governance. Statutory filings & corporate secretarial services",
          "Deep understanding of corporate regulations and helping businesses stay compliant with statutory requirements."
        ],
        expertise: [
          "Company incorporation & compliances",
          "Post Incorporation Compliances & ROC Filings"
        ]
      }
    };

    var modalPhoto = document.getElementById("teamModalPhoto");
    var modalName = document.getElementById("teamModalName");
    var modalLinkedin = document.getElementById("teamModalLinkedin");
    var modalBio = document.getElementById("teamModalBio");
    var modalAchievements = document.getElementById("teamModalAchievements");
    var modalDesignation = document.getElementById("teamModalDesignation");
    var modalQualifications = document.getElementById("teamModalQualifications");
    var modalExperience = document.getElementById("teamModalExperience");
    var modalCredentials = document.getElementById("teamModalCredentials");
    var modalExperienceList = document.getElementById("teamModalExperienceList");
    var modalExpertise = document.getElementById("teamModalExpertise");
    var lastFocusedCard = null;

    function fillList(listEl, items) {
      listEl.innerHTML = "";
      items.forEach(function (text) {
        var li = document.createElement("li");
        li.textContent = text;
        listEl.appendChild(li);
      });
    }

    function openTeamModal(memberKey, triggerEl) {
      var member = teamData[memberKey];
      if (!member) return;

      lastFocusedCard = triggerEl || null;
      modalPhoto.src = member.photo;
      modalPhoto.alt = member.name;
      modalName.textContent = member.name;
      modalLinkedin.href = member.linkedin;
      modalBio.textContent = member.bio;
      modalDesignation.textContent = member.designation;
      modalQualifications.textContent = member.qualifications;
      modalExperience.textContent = member.experience;
      fillList(modalAchievements, member.achievements);
      fillList(modalCredentials, member.credentials);
      fillList(modalExperienceList, member.experienceList);
      fillList(modalExpertise, member.expertise);

      teamModal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function closeTeamModal() {
      teamModal.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocusedCard) lastFocusedCard.focus();
    }

    teamCards.forEach(function (card) {
      card.addEventListener("click", function () {
        openTeamModal(card.dataset.teamMember, card);
      });
    });

    teamModal.querySelectorAll("[data-modal-close]").forEach(function (el) {
      el.addEventListener("click", closeTeamModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && teamModal.classList.contains("is-open")) {
        closeTeamModal();
      }
    });
  }

  /* ---------- Blog post view counter ---------- */
  var viewsEl = document.querySelector(".blog-post-views");
  if (viewsEl) {
    try {
      var storageKey = "blogViews:" + window.location.pathname;
      var baseViews = parseInt(viewsEl.dataset.baseViews, 10) || 0;
      var extraViews = (parseInt(window.localStorage.getItem(storageKey), 10) || 0) + 1;
      window.localStorage.setItem(storageKey, String(extraViews));
      viewsEl.textContent = (baseViews + extraViews) + " views";
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) — leave the static count as-is
    }
  }
})();

