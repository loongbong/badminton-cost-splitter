document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const attendeesInput = document.getElementById('attendees');
    const numCourtsInput = document.getElementById('num-courts');
    const courtHoursInput = document.getElementById('court-hours');
    const courtRateInput = document.getElementById('court-rate');
    const shuttlesUsedInput = document.getElementById('shuttles-used');
    const shuttlePriceInput = document.getElementById('shuttle-price');
    const toggleGuestsCheckbox = document.getElementById('toggle-guests');
    const guestInputSection = document.getElementById('guest-input-section');
    const guestsInput = document.getElementById('guests');
    const guestFeeInput = document.getElementById('guest-fee');
    const toggleOtherCostsCheckbox = document.getElementById('toggle-other-costs');
    const otherCostsInputSection = document.getElementById('other-costs-input-section');
    const otherCostsInput = document.getElementById('other-costs');
    const calculateBtn = document.getElementById('calculate-btn');
    const saveDefaultsBtn = document.getElementById('save-defaults-btn');
    const loadDefaultsBtn = document.getElementById('load-defaults-btn');
    const defaultsMsg = document.getElementById('defaults-msg');
    const resultsDiv = document.getElementById('results');
    const resultAttendeesSpan = document.getElementById('result-attendees');
    const courtTotalSpan = document.getElementById('court-total');
    const shuttleTotalSpan = document.getElementById('shuttle-total');
    const guestTotalSpan = document.getElementById('guest-total');
    const guestResultLine = document.getElementById('guest-result-line');
    const otherTotalSpan = document.getElementById('other-total');
    const otherResultLine = document.getElementById('other-result-line');
    const totalCostSpan = document.getElementById('total-cost');
    const costPerPersonSpan = document.getElementById('cost-per-person');
    const copyResultsBtn = document.getElementById('copy-results-btn');
    const copyBuffer = document.getElementById('copy-buffer');

    // --- Local Storage Keys ---
    const defaultKeys = { guestFee: 'guest-fee', courtRate: 'court-rate', shuttlePrice: 'shuttle-price' };
    const localStorageKey = 'badmintonDefaults';
    // Removed QR storage keys

    // --- Global variable to store current results for copying ---
    let currentResults = null;

    // --- Functions ---

    function formatCurrency(amount) {
        const num = parseFloat(amount);
        return isNaN(num) ? 'RM 0.00' : `RM ${num.toFixed(2)}`;
     }

    function toggleSectionVisibility(checkbox, section) {
        if (checkbox.checked) { section.classList.add('visible'); section.style.display = 'flex'; }
        else { section.classList.remove('visible'); section.style.display = 'none';
            if (section === guestInputSection) guestsInput.value = '0';
            else if (section === otherCostsInputSection) otherCostsInput.value = '0.00';
        }
     }

    function handleStep(event) {
        const button = event.target; const targetInputId = button.dataset.target;
        const targetInput = document.getElementById(targetInputId); if (!targetInput) return;
        const step = parseFloat(button.dataset.step || targetInput.step || 1);
        const min = parseFloat(targetInput.min || 0); const max = parseFloat(targetInput.max || Infinity);
        let currentValue = parseFloat(targetInput.value) || 0;
        if (button.classList.contains('plus')) { currentValue = Math.min(max, currentValue + step); }
        else if (button.classList.contains('minus')) { currentValue = Math.max(min, currentValue - step); }
        if (step < 1) { const precision = Math.max(step.toString().split('.')[1]?.length || 0, 2); targetInput.value = currentValue.toFixed(precision); }
        else { targetInput.value = currentValue; }
    }

    // Removed handleQrUpload function
    // Removed loadQrImagesFromStorage function

    function calculateCost() {
        // --- Get Values ---
        const attendees = parseInt(attendeesInput.value) || 0;
        const numCourts = parseInt(numCourtsInput.value) || 1;
        const courtHours = parseFloat(courtHoursInput.value) || 0;
        const courtRate = parseFloat(courtRateInput.value) || 0;
        const shuttlesUsed = parseInt(shuttlesUsedInput.value) || 0;
        const shuttlePrice = parseFloat(shuttlePriceInput.value) || 0;
        let guests = 0, guestFee = 0, otherCosts = 0;
        if (toggleGuestsCheckbox.checked) { guests = parseInt(guestsInput.value) || 0; guestFee = parseFloat(guestFeeInput.value) || 0; }
        if (toggleOtherCostsCheckbox.checked) { otherCosts = parseFloat(otherCostsInput.value) || 0; }

        // --- Calculations ---
        const courtTotal = numCourts * courtHours * courtRate;
        const shuttleTotal = shuttlesUsed * shuttlePrice;
        const guestTotal = guests * guestFee;
        const totalCost = courtTotal + shuttleTotal + guestTotal + otherCosts;
        let costPerPerson = attendees > 0 ? totalCost / attendees : 0;

        if (attendees <= 0) {
            alert("Please enter a valid number of attendees (at least 1).");
            resultsDiv.style.display = 'none';
            currentResults = null;
            return;
        }

        // --- Store results globally ---
        currentResults = {
            attendees: attendees, courtTotal: courtTotal, shuttleTotal: shuttleTotal,
            guestTotal: guestTotal, otherCosts: otherCosts, totalCost: totalCost,
            costPerPerson: costPerPerson,
            guestFeeIncluded: toggleGuestsCheckbox.checked && guestTotal > 0,
            otherCostsIncluded: toggleOtherCostsCheckbox.checked && otherCosts > 0
        };

        // --- Display Results ---
        resultAttendeesSpan.textContent = attendees;
        courtTotalSpan.textContent = formatCurrency(courtTotal);
        shuttleTotalSpan.textContent = formatCurrency(shuttleTotal);
        if (currentResults.guestFeeIncluded) { guestTotalSpan.textContent = formatCurrency(guestTotal); guestResultLine.style.display = 'flex'; guestResultLine.classList.add('visible'); }
        else { guestResultLine.style.display = 'none'; guestResultLine.classList.remove('visible'); }
        if (currentResults.otherCostsIncluded) { otherTotalSpan.textContent = formatCurrency(otherCosts); otherResultLine.style.display = 'flex'; otherResultLine.classList.add('visible'); }
        else { otherResultLine.style.display = 'none'; otherResultLine.classList.remove('visible'); }
        totalCostSpan.textContent = formatCurrency(totalCost);
        costPerPersonSpan.textContent = formatCurrency(costPerPerson);
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- Copy Results Function ---
    async function copyResults() {
        if (!currentResults) { alert("Please calculate the costs first."); return; }
        let summary = `Badminton Session Summary:\n`;
        summary += `--------------------\n`;
        summary += `Attendees: ${currentResults.attendees}\n`;
        summary += `Court Fees: ${formatCurrency(currentResults.courtTotal)}\n`;
        summary += `Shuttle Fees: ${formatCurrency(currentResults.shuttleTotal)}\n`;
        if (currentResults.guestFeeIncluded) { summary += `Guest Fees: ${formatCurrency(currentResults.guestTotal)}\n`; }
        if (currentResults.otherCostsIncluded) { summary += `Other Costs: ${formatCurrency(currentResults.otherCosts)}\n`; }
        summary += `--------------------\n`;
        summary += `Total Cost: ${formatCurrency(currentResults.totalCost)}\n`;
        summary += `Cost Per Person: ${formatCurrency(currentResults.costPerPerson)}`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try { await navigator.clipboard.writeText(summary); const originalText = copyResultsBtn.textContent; copyResultsBtn.textContent = 'Copied!'; setTimeout(() => { copyResultsBtn.textContent = originalText; }, 2000); }
            catch (err) { console.error('Failed to copy text:', err); fallbackCopyTextToClipboard(summary); }
        } else { fallbackCopyTextToClipboard(summary); }
    }

    // --- Fallback Copy Method ---
    function fallbackCopyTextToClipboard(text) {
        copyBuffer.value = text; copyBuffer.style.display = 'block'; copyBuffer.select();
        try { var successful = document.execCommand('copy'); var msg = successful ? 'successful' : 'unsuccessful'; console.log('Fallback copy: ' + msg);
             if (successful) { const originalText = copyResultsBtn.textContent; copyResultsBtn.textContent = 'Copied (Fallback)!'; setTimeout(() => { copyResultsBtn.textContent = originalText; }, 2000); }
             else { alert('Could not copy results using fallback.'); }
        } catch (err) { console.error('Fallback copy error:', err); alert('Could not copy results using fallback.'); }
        copyBuffer.style.display = 'none';
    }

    // --- Save/Load Defaults Functions ---
    function saveDefaults() {
        const defaults = {
            [defaultKeys.guestFee]: guestFeeInput.value || "10.00",
            [defaultKeys.courtRate]: courtRateInput.value || "8.50",
            [defaultKeys.shuttlePrice]: shuttlePriceInput.value || "10.00",
        };
        try { localStorage.setItem(localStorageKey, JSON.stringify(defaults)); defaultsMsg.textContent = 'Defaults saved!'; setTimeout(() => { defaultsMsg.textContent = ''; }, 3000); }
        catch (e) { console.error("Error saving defaults:", e); defaultsMsg.textContent = 'Error saving.'; setTimeout(() => { defaultsMsg.textContent = ''; }, 3000); }
    }

    function loadDefaults() {
         defaultsMsg.textContent = '';
        try { const savedDefaults = localStorage.getItem(localStorageKey);
             if (savedDefaults) { const defaults = JSON.parse(savedDefaults);
                 if (defaults[defaultKeys.guestFee] !== undefined) guestFeeInput.value = defaults[defaultKeys.guestFee];
                 if (defaults[defaultKeys.courtRate] !== undefined) courtRateInput.value = defaults[defaultKeys.courtRate];
                 if (defaults[defaultKeys.shuttlePrice] !== undefined) shuttlePriceInput.value = defaults[defaultKeys.shuttlePrice];
                 defaultsMsg.textContent = 'Defaults loaded.'; setTimeout(() => { defaultsMsg.textContent = ''; }, 3000);
             } else { defaultsMsg.textContent = 'No saved defaults.'; setTimeout(() => { defaultsMsg.textContent = ''; }, 3000); }
        } catch (e) { console.error("Error loading defaults:", e); defaultsMsg.textContent = 'Error loading.'; setTimeout(() => { defaultsMsg.textContent = ''; }, 3000); }
    }

    function initialLoadDefaults() {
        const savedDefaults = localStorage.getItem(localStorageKey);
        if (savedDefaults) { try { const defaults = JSON.parse(savedDefaults);
                 if (defaults[defaultKeys.guestFee] !== undefined) guestFeeInput.value = defaults[defaultKeys.guestFee];
                 if (defaults[defaultKeys.courtRate] !== undefined) courtRateInput.value = defaults[defaultKeys.courtRate];
                 if (defaults[defaultKeys.shuttlePrice] !== undefined) shuttlePriceInput.value = defaults[defaultKeys.shuttlePrice];
             } catch (e) { console.error("Error parsing saved defaults:", e); }
        }
    }

    // --- Event Listeners ---
    calculateBtn.addEventListener('click', calculateCost);
    saveDefaultsBtn.addEventListener('click', saveDefaults);
    loadDefaultsBtn.addEventListener('click', loadDefaults);
    toggleGuestsCheckbox.addEventListener('change', () => toggleSectionVisibility(toggleGuestsCheckbox, guestInputSection));
    toggleOtherCostsCheckbox.addEventListener('change', () => toggleSectionVisibility(toggleOtherCostsCheckbox, otherCostsInputSection));
    document.getElementById('cost-form').addEventListener('click', (event) => { if (event.target.classList.contains('stepper-btn')) handleStep(event); });
    copyResultsBtn.addEventListener('click', copyResults);
    // Removed QR upload listeners

    // --- Initialisation ---
    toggleSectionVisibility(toggleGuestsCheckbox, guestInputSection);
    toggleSectionVisibility(toggleOtherCostsCheckbox, otherCostsInputSection);
    initialLoadDefaults();
    // Removed QR image loading call

}); // End DOMContentLoaded