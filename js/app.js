document.addEventListener('DOMContentLoaded', () => {
  console.debug('[app.js] DOMContentLoaded - simplified manual rule configuration');

  // Toggle builder visibility
  const toggle = document.getElementById('toggle-conditional');
  const builder = document.getElementById('conditional-builder');
  console.debug('[app.js] toggle:', !!toggle, ', builder:', !!builder);

  if (toggle && builder) {
    // Set initial state based on toggle
    builder.style.display = toggle.checked ? 'block' : 'none';

    toggle.addEventListener('change', () => {
      builder.style.display = toggle.checked ? 'block' : 'none';
      // If toggled ON and no conditions, add one
      const conditionsContainer = document.getElementById('conditions-container');
      if (toggle.checked && conditionsContainer && conditionsContainer.children.length === 0) {
        addCondition();
      }
    });

    // On page load, if toggle is checked and container is empty, add a condition
    const conditionsContainer = document.getElementById('conditions-container');
    if (toggle.checked && conditionsContainer && conditionsContainer.children.length === 0) {
      addCondition();
    }
  }

  // Event delegation for "+ Add Condition" button
  const addConditionBtn = document.getElementById('add-condition-btn');
  if (addConditionBtn) {
    addConditionBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.debug('[app.js] add condition button clicked');
      const conditionsContainer = document.getElementById('conditions-container');
      if (!conditionsContainer) {
        console.error('[app.js] conditions-container not found');
        return;
      }
      const conditionCount = conditionsContainer.querySelectorAll('.condition-row').length;
      console.debug('[app.js] current conditionCount:', conditionCount);

      // Limit number of conditions
      if (conditionCount >= 10) {
        let err = document.getElementById('condition-limit-error');
        if (!err) {
          err = document.createElement('div');
          err.id = 'condition-limit-error';
          err.textContent = 'Maximum 10 conditions allowed';
          err.style.color = '#c00';
          err.style.fontSize = '0.95em';
          err.style.marginTop = '0.5em';
          addConditionBtn.after(err);
          setTimeout(() => { if (err) err.remove(); }, 3000);
        }
        return;
      } else {
        const err = document.getElementById('condition-limit-error');
        if (err) err.remove();
      }
      console.debug('[app.js] calling addCondition()');
      addCondition();
      updateRemoveButtons();
    });
  }

  function addCondition(withOperator = false) {
    const conditionsContainer = document.getElementById('conditions-container');
    if (!conditionsContainer) return;

    const conditionCount = conditionsContainer.querySelectorAll('.condition-row').length;
    
    // For the first condition, no operator. For subsequent ones, add operator
    withOperator = conditionCount > 0;

    const row = document.createElement('div');
    row.className = 'condition-row';

    // AND/OR dropdown (for conditions after the first)
    if (withOperator) {
      const operatorSelect = document.createElement('select');
      operatorSelect.className = 'operator-select';
      operatorSelect.innerHTML = '<option value="and">AND</option><option value="or">OR</option>';
      row.appendChild(operatorSelect);
    }

    // Field name input
    const fieldInput = document.createElement('input');
    fieldInput.type = 'text';
    fieldInput.className = 'field-name-input';
    fieldInput.placeholder = 'Field name (e.g., country)';
    row.appendChild(fieldInput);

    // Equals label
    const equalsLabel = document.createElement('span');
    equalsLabel.className = 'equals-label';
    equalsLabel.textContent = '=';
    row.appendChild(equalsLabel);

    // Field value input
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'field-value-input';
    valueInput.placeholder = 'Value (e.g., United States)';
    row.appendChild(valueInput);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '–';
    removeBtn.type = 'button';
    removeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      row.remove();
      updateRemoveButtons();
      validateConditions();
    });
    row.appendChild(removeBtn);

    conditionsContainer.appendChild(row);
    updateRemoveButtons();

    // Add validation listeners
    fieldInput.addEventListener('input', validateConditions);
    valueInput.addEventListener('input', validateConditions);
  }

  function updateRemoveButtons() {
    const conditionsContainer = document.getElementById('conditions-container');
    if (!conditionsContainer) return;

    const rows = conditionsContainer.querySelectorAll('.condition-row');
    rows.forEach((row, idx) => {
      const btn = row.querySelector('.remove-btn');
      if (btn) {
        // Hide remove button for the first condition
        btn.style.display = (idx === 0) ? 'none' : 'inline-block';
      }
    });
  }

  function validateConditions() {
    const conditionsContainer = document.getElementById('conditions-container');
    if (!conditionsContainer) return;

    // Remove any previous validation errors
    const existingErrors = conditionsContainer.querySelectorAll('.validation-error');
    existingErrors.forEach(err => err.remove());

    const rows = conditionsContainer.querySelectorAll('.condition-row');
    let hasError = false;

    rows.forEach(row => {
      const fieldInput = row.querySelector('.field-name-input');
      const valueInput = row.querySelector('.field-value-input');

      // Check if both fields are filled
      if (fieldInput && valueInput) {
        const fieldValue = fieldInput.value.trim();
        const valueValue = valueInput.value.trim();

        // Only validate if user has started typing
        if ((fieldValue && !valueValue) || (!fieldValue && valueValue)) {
          hasError = true;
          row.style.borderLeft = '3px solid #c00';
        } else {
          row.style.borderLeft = '';
        }
      }
    });

    return !hasError;
  }

  // Update confirmation target label based on selection
  const topSelect = document.getElementById('confirmation-target');
  const defaultLabel = document.getElementById('default-label');
  const defaultInput = document.getElementById('default-input');
  const alternateConfirmationUrl = document.getElementById('alternate-confirmation-url');

  if (topSelect && defaultLabel && defaultInput) {
    topSelect.addEventListener('change', () => {
      const type = topSelect.value;
      
      // Update default confirmation label and input
      if (type === 'redirect') {
        defaultLabel.textContent = 'Choose default confirmation page *';
        defaultInput.placeholder = 'https://';
        defaultInput.type = 'text';
        if (alternateConfirmationUrl) {
          document.querySelector('#alternate-confirmation-group label').textContent = 'Alternate confirmation URL *';
          alternateConfirmationUrl.placeholder = 'https://';
        }
      } else if (type === 'modal') {
        defaultLabel.textContent = 'Choose default modal content *';
        defaultInput.placeholder = 'Select .html file...';
        defaultInput.type = 'file';
        defaultInput.accept = '.html';
        if (alternateConfirmationUrl) {
          document.querySelector('#alternate-confirmation-group label').textContent = 'Alternate modal content *';
          alternateConfirmationUrl.placeholder = 'Select .html file...';
          alternateConfirmationUrl.type = 'file';
          alternateConfirmationUrl.accept = '.html';
        }
      } else if (type === 'download') {
        defaultLabel.textContent = 'Choose default download file *';
        defaultInput.placeholder = 'Select .zip file...';
        defaultInput.type = 'file';
        defaultInput.accept = '.zip';
        if (alternateConfirmationUrl) {
          document.querySelector('#alternate-confirmation-group label').textContent = 'Alternate download file *';
          alternateConfirmationUrl.placeholder = 'Select .zip file...';
          alternateConfirmationUrl.type = 'file';
          alternateConfirmationUrl.accept = '.zip';
        }
      }
    });
  }

  // Save button validation
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.debug('[app.js] save button clicked');
      
      // Remove any existing global errors
      const existingGlobalError = document.getElementById('save-global-error');
      if (existingGlobalError) existingGlobalError.remove();

      let hasError = false;
      const errors = [];

      // Validate default confirmation
      const defaultInput = document.getElementById('default-input');
      if (defaultInput) {
        const defaultValue = defaultInput.value.trim();
        if (!defaultValue) {
          hasError = true;
          errors.push('Default confirmation is required');
          defaultInput.style.border = '2px solid #c00';
        } else {
          defaultInput.style.border = '';
        }
      }

      // Check if conditional logic is enabled
      const condToggle = document.getElementById('toggle-conditional');
      if (condToggle && condToggle.checked) {
        const conditionsContainer = document.getElementById('conditions-container');
        const rows = conditionsContainer.querySelectorAll('.condition-row');

        // Must have at least one condition if enabled
        if (rows.length === 0) {
          hasError = true;
          errors.push('At least one condition is required when conditional logic is enabled');
        }

        // Validate each condition
        rows.forEach((row, idx) => {
          const fieldInput = row.querySelector('.field-name-input');
          const valueInput = row.querySelector('.field-value-input');

          if (fieldInput && valueInput) {
            const fieldValue = fieldInput.value.trim();
            const valueValue = valueInput.value.trim();

            if (!fieldValue || !valueValue) {
              hasError = true;
              errors.push(`Condition ${idx + 1}: Both field name and value are required`);
              row.style.borderLeft = '3px solid #c00';
            } else {
              row.style.borderLeft = '';
            }
          }
        });

        // Validate alternate confirmation URL
        const alternateUrl = document.getElementById('alternate-confirmation-url');
        if (alternateUrl) {
          const alternateValue = alternateUrl.value.trim();
          if (!alternateValue) {
            hasError = true;
            errors.push('Alternate confirmation URL is required when conditional logic is enabled');
            alternateUrl.style.border = '2px solid #c00';
          } else {
            alternateUrl.style.border = '';
          }
        }

        // Check for duplicate conditions (same field/value pairs)
        const conditionPairs = [];
        rows.forEach(row => {
          const fieldInput = row.querySelector('.field-name-input');
          const valueInput = row.querySelector('.field-value-input');
          if (fieldInput && valueInput) {
            const pair = `${fieldInput.value.trim()}=${valueInput.value.trim()}`;
            if (conditionPairs.includes(pair)) {
              hasError = true;
              errors.push('Duplicate conditions detected');
            } else {
              conditionPairs.push(pair);
            }
          }
        });
      }

      // Display errors if any
      if (hasError) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'save-global-error';
        errorDiv.style.color = '#c00';
        errorDiv.style.fontSize = '1em';
        errorDiv.style.marginBottom = '1em';
        errorDiv.style.padding = '1em';
        errorDiv.style.backgroundColor = '#fee';
        errorDiv.style.border = '1px solid #c00';
        errorDiv.style.borderRadius = '4px';
        
        const title = document.createElement('strong');
        title.textContent = 'Please fix the following errors:';
        errorDiv.appendChild(title);
        
        const errorList = document.createElement('ul');
        errorList.style.marginTop = '0.5em';
        errorList.style.marginBottom = '0';
        errors.forEach(error => {
          const li = document.createElement('li');
          li.textContent = error;
          errorList.appendChild(li);
        });
        errorDiv.appendChild(errorList);

        const confirmationContent = document.getElementById('confirmation-content');
        confirmationContent.insertBefore(errorDiv, confirmationContent.firstChild);

        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      // If no errors, collect the data and log it (or save it)
      const configData = {
        confirmationTarget: document.getElementById('confirmation-target')?.value,
        defaultConfirmation: defaultInput?.value,
        conditionalLogicEnabled: condToggle?.checked || false
      };

      if (configData.conditionalLogicEnabled) {
        const conditions = [];
        const conditionsContainer = document.getElementById('conditions-container');
        const rows = conditionsContainer.querySelectorAll('.condition-row');
        
        rows.forEach((row, idx) => {
          const operatorSelect = row.querySelector('.operator-select');
          const fieldInput = row.querySelector('.field-name-input');
          const valueInput = row.querySelector('.field-value-input');
          
          conditions.push({
            operator: idx === 0 ? null : operatorSelect?.value || 'and',
            fieldName: fieldInput?.value.trim(),
            fieldValue: valueInput?.value.trim()
          });
        });

        configData.conditions = conditions;
        configData.alternateConfirmation = document.getElementById('alternate-confirmation-url')?.value;
      }

      console.log('[app.js] Configuration saved:', configData);
      alert('Configuration saved successfully!\n\nSee console for saved data.');
    });
  }

  // Cancel button
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.debug('[app.js] cancel button clicked');
      // In a real implementation, this would close the dialog or reset the form
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        console.log('[app.js] User cancelled');
        // Reset or close dialog
      }
    });
  }

  // Close modal button
  const closeBtn = document.getElementById('close-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.debug('[app.js] close button clicked');
      if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
        console.log('[app.js] Modal closed');
        // Close the modal
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
          modalOverlay.classList.remove('open');
        }
      }
    });
  }

  console.debug('[app.js] Initialization complete');
});