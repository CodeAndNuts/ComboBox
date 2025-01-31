import '/src/components/comboBox/comboBox.css';

const comboBoxInstances = {};

function ComboBox(data, arg0, arg1, controlID = null) {
    const configDefault = {
        autoFill: true,
        valueField: 'id',
        textField: 'text',
        allOptionsName: '',
        "function": null,
        class: 'input,autocomplete,form-control,d-flex,align-items-center',
        textTooltip: 'No hay datos disponibles'
    };

    let state = {
        data: data,
        config: { ...configDefault, ...arg0 },
        filteredData: [...data],
        controlId: controlID,
        selectedValue: null,
        highlightedIndex: -1,
        tooltipInstance: null,
        disabled: false
    };

    function init() {
        const originalSelect = document.getElementById(state.controlId);

        if (!isNotNullOrUndefined(originalSelect)) return;

        if (originalSelect?.classList.contains('can-combobox')) {

            if (comboBoxInstances[controlID]) {
                state = comboBoxInstances[controlID].state;

                state.data = data;
                state.filteredData = [...data];
                state.config = { ...state.config, ...arg0 };

                // Validar si el valor seleccionado aún existe en los datos
                if (!state.data.find(item => item[state.config.valueField] == state.selectedValue)) {
                    clearSelection(); // Borra la selección si el valor ya no existe
                }

                populateOptions();
                updateClearButtonVisibility();
                attachEventListeners();

                if (state.filteredData.length > 0) {
                    const firstItem = state.filteredData[0];
                    if (state.config.autoFill) {
                        setValue(firstItem[state.config.valueField], firstItem[state.config.textField]);
                    } else {
                        state.selectedValue = null;
                        populateOptions();
                    }
                } else {
                    state.selectedValue = null;
                }

                manageTooltip();

                return comboBoxInstances[controlID];
            }

            populateOptions();
            return;
        }

        const comboBoxContainer = document.createElement('div');
        comboBoxContainer.id = `${state.controlId}-container`;
        const classes = state.config.class.split(',');
        for (const cla of classes) comboBoxContainer.classList.add(cla);

        comboBoxContainer.classList.add('can-combobox', 'can-input', 'can-input-md', 'can-rounded-md', 'can-input-solid');

        const input = document.createElement('input');
        input.type = 'text';
        input.className = `can-combobox can-input-inner ${originalSelect.className}`;
        input.id = state.controlId;
        input.style.border = '0px';
        input.style.outline = '0px';
        input.style.background = 'none';
        input.style.textOverflow = 'ellipsis';
        input.style.minWidth = '0px';
        input.style.flexGrow = '1';
        input.autocomplete = 'off';
        input.placeholder = originalSelect.getAttribute('placeholder') || 'Seleccionar...';
        input.required = originalSelect.required;

        Array.from(originalSelect.attributes).forEach(attr => {
            if (!['id', 'class', 'style', 'type'].includes(attr.name)) {
                input.setAttribute(attr.name, attr.value);
            }
        });

        comboBoxContainer.appendChild(input);

        const clearButton = document.createElement('span');
        clearButton.className = 'can-clear-value';
        clearButton.role = 'button';
        clearButton.tabIndex = -1;
        clearButton.title = 'clear';
        clearButton.innerHTML = '<i class="fas fa-times can-icon"></i>';
        comboBoxContainer.appendChild(clearButton);

        const dropdownButton = document.createElement('button');
        dropdownButton.className = 'can-button can-input-button';
        dropdownButton.type = 'button';
        dropdownButton.tabIndex = -1;
        dropdownButton.ariaLabel = 'expand button';
        dropdownButton.innerHTML = '<i class="fas fa-angle-down can-icon"></i>';
        comboBoxContainer.appendChild(dropdownButton);

        const listbox = document.createElement('div');
        listbox.id = 'listbox-options';
        listbox.className = 'can-listbox';
        listbox.role = 'listbox';
        listbox.tabIndex = '-1';
        comboBoxContainer.appendChild(listbox);

        state.comboBoxInput = input;
        state.listbox = listbox;
        state.clearButton = clearButton;
        state.dropdownButton = dropdownButton;

        comboBoxInstances[controlID] = {
            add: add,
            del: del,
            disable: disable,
            enable: enable,
            get: get,
            getAll: getAll,
            set: set,
            state: state,
            udp: udp
        };

        populateOptions();
        attachEventListeners();
        updateClearButtonVisibility();

        if (state.filteredData.length > 0) {
            const firstItem = state.filteredData[0];
            if (state.config.autoFill) {
                setValue(firstItem[state.config.valueField], firstItem[state.config.textField]);
            } else {
                state.selectedValue = null;
                populateOptions();
            }
        }

        manageTooltip();

        originalSelect.replaceWith(comboBoxContainer);
        originalSelect.remove();
    }

    function manageTooltip() {
        if (state.data.length === 0) {
            if (!state.tooltipInstance) {
                state.tooltipInstance = tippy(state.comboBoxInput, {
                    content: state.config.textTooltip,
                    placement: 'top-end',
                    trigger: 'mouseenter focus',
                });
            } else {
                state.tooltipInstance.setContent(state.config.textTooltip);
            }
        } else {
            if (state.tooltipInstance) {
                state.tooltipInstance.destroy();
                state.tooltipInstance = null;
            }
        }
    }

    function populateOptions() {
        state.listbox.innerHTML = '';
        state.filteredData.forEach((item, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'can-list-item';
            optionElement.dataset.value = item[state.config.valueField];
            optionElement.dataset.index = index;
            optionElement.textContent = item[state.config.textField];
            if (item[state.config.valueField] === state.selectedValue) {
                optionElement.classList.add('selected');
                state.highlightedIndex = index;
            }
            state.listbox.appendChild(optionElement);
        });
    }

    function updateClearButtonVisibility() {
        state.clearButton.style.display = state.selectedValue ? 'inline' : 'none';
    }

    function setValue(value, text) {
        state.selectedValue = value;
        state.comboBoxInput.value = text;
        resetFilter();
        populateOptions();
        updateClearButtonVisibility();
        state.listbox.classList.remove('active');

        state.comboBoxInput.dispatchEvent(new Event('change', { bubbles: true }));

        manageTooltip();
    }

    function clearSelection() {
        if (state.disabled) return;
        state.selectedValue = null;
        state.comboBoxInput.value = '';
        resetFilter();
        populateOptions();
        updateClearButtonVisibility();

        state.comboBoxInput.dispatchEvent(new Event('change', { bubbles: true }));

        manageTooltip();
    }

    function filterOptions() {
        const query = state.comboBoxInput.value.toLowerCase();
        state.filteredData = state.data.filter(item => item[state.config.textField].toLowerCase().includes(query));
        populateOptions();
        state.highlightedIndex = -1;
    }

    function toggleListbox() {
        if (state.disabled) return;
        if (state.listbox.classList.contains('active')) {
            state.listbox.classList.remove('active');
        } else {
            resetFilter();
            showListbox();
        }
    }

    function showListbox() {
        const rect = state.comboBoxInput.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        state.listbox.style.top = `${rect.bottom + scrollTop}px`;
        state.listbox.style.left = `${rect.left + scrollLeft}px`;
        state.listbox.style.width = `${rect.width}px`;
        state.listbox.classList.add('active');
        highlightSelected();
    }

    function hideListbox() {
        state.listbox.classList.remove('active');
    }

    function resetFilter() {
        state.filteredData = [...state.data];
        populateOptions();
        state.highlightedIndex = -1;
    }

    function highlightSelected() {
        const items = state.listbox.querySelectorAll('.can-list-item');
        items.forEach((item, index) => {
            item.classList.remove('selected');
            if (item.dataset.value == state.selectedValue) {
                item.classList.add('selected');
                state.highlightedIndex = index;
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function navigateList(direction) {
        const items = state.listbox.querySelectorAll('.can-list-item');
        state.highlightedIndex = Math.min(Math.max(state.highlightedIndex + direction, 0), items.length - 1);
        items.forEach((item, index) => {
            item.classList.remove('hover');
            if (index === state.highlightedIndex) {
                item.classList.add('hover');
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function selectHighlighted() {
        const items = state.listbox.querySelectorAll('.can-list-item');
        if (state.highlightedIndex >= 0 && state.highlightedIndex < items.length) {
            const selectedItem = items[state.highlightedIndex];
            setValue(selectedItem.dataset.value, selectedItem.textContent);
        }
    }

    function attachEventListeners() {
        if (state.eventHandlers) {
            state.dropdownButton.removeEventListener('blur', state.eventHandlers.hideListbox);
            state.dropdownButton.removeEventListener('click', state.eventHandlers.toggleListbox);
            state.clearButton.removeEventListener('click', state.eventHandlers.clearSelection);
            state.listbox.removeEventListener('mousedown', state.eventHandlers.listboxMouseDown);
            state.listbox.removeEventListener('click', state.eventHandlers.listboxClick);
            state.comboBoxInput.removeEventListener('focus', state.eventHandlers.showListbox);
            state.comboBoxInput.removeEventListener('keydown', state.eventHandlers.keydownHandler);
            state.comboBoxInput.removeEventListener('input', state.eventHandlers.inputHandler);
            state.comboBoxInput.removeEventListener('blur', state.eventHandlers.blurHandler);
            state.listbox.removeEventListener('mousemove', state.eventHandlers.mousemoveHandler);
            state.comboBoxInput.removeEventListener('click', state.eventHandlers.inputClick);
            if (state.eventHandlers.changeHandler) {
                state.comboBoxInput.removeEventListener('change', state.eventHandlers.changeHandler);
            }
        } else {
            state.eventHandlers = {};
        }

        state.eventHandlers.toggleListbox = toggleListbox;
        state.eventHandlers.clearSelection = clearSelection;

        state.eventHandlers.listboxMouseDown = (event) => {
            event.preventDefault();
        }

        state.eventHandlers.listboxClick = (event) => {
            if (event.target.classList.contains('can-list-item')) {
                state.comboBoxInput.focus();
                setValue(event.target.dataset.value, event.target.textContent);
            }
        };

        state.eventHandlers.showListbox = showListbox;
        state.eventHandlers.hideListbox = hideListbox;

        state.eventHandlers.keydownHandler = (event) => {
            if (state.disabled) return;
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (!state.listbox.classList.contains('active')) {
                    showListbox();
                } else {
                    navigateList(1);
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                navigateList(-1);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                selectHighlighted();
            }
        };

        state.eventHandlers.inputHandler = () => {
            const query = state.comboBoxInput.value.toLowerCase();
            if (!clean(query)) clearSelection();
            filterOptions();
            showListbox();
        };

        state.eventHandlers.blurHandler = (e) => {
            const query = clean(state.comboBoxInput.value);
            const selectedItem = state.data.find(item => item[state.config.valueField].toString() === state.selectedValue);
            const value = selectedItem?.[state.config.valueField]?.toString();
            const text = selectedItem?.[state.config.textField];

            if (!selectedItem || !text.startsWith(query)) {
                clearSelection();
            } else {
                setValue(value, text);
            }
            hideListbox();
        };

        state.eventHandlers.mousemoveHandler = (event) => {
            const items = state.listbox.querySelectorAll('.can-list-item');
            items.forEach(item => item.classList.remove('hover'));
            if (event.target.classList.contains('can-list-item')) {
                event.target.classList.add('hover');
            }
        };

        state.eventHandlers.inputClick = (event) => {
            if (!state.listbox.classList.contains('active')) {
                showListbox();
            }
        };

        state.dropdownButton.addEventListener('blur', state.eventHandlers.hideListbox);
        state.dropdownButton.addEventListener('click', state.eventHandlers.toggleListbox);
        state.clearButton.addEventListener('click', state.eventHandlers.clearSelection);
        state.listbox.addEventListener('mousedown', state.eventHandlers.listboxMouseDown);
        state.listbox.addEventListener('click', state.eventHandlers.listboxClick);
        state.comboBoxInput.addEventListener('focus', state.eventHandlers.showListbox);
        state.comboBoxInput.addEventListener('keydown', state.eventHandlers.keydownHandler);
        state.comboBoxInput.addEventListener('input', state.eventHandlers.inputHandler);
        state.comboBoxInput.addEventListener('blur', state.eventHandlers.blurHandler);
        state.listbox.addEventListener('mousemove', state.eventHandlers.mousemoveHandler);
        state.comboBoxInput.addEventListener('click', state.eventHandlers.inputClick);

        if (typeof state.config.function === 'function') {
            state.eventHandlers.changeHandler = () => {
                state.config.function(
                    state.selectedValue,
                    state.comboBoxInput.value,
                    state.comboBoxInput.id
                );
            };

            state.comboBoxInput.addEventListener('change', state.eventHandlers.changeHandler);
        }
    }

    function get(fullData = false) {
        if (fullData) {
            return state.data.find(item => item[state.config.valueField] == state.selectedValue) || null;
        }
        return state.selectedValue || null;
    }

    function add(item) {
        state.data.push(item);
        resetFilter();
        manageTooltip();
    }

    function del(value) {
        state.data = state.data.filter(item => item[state.config.valueField] != value);
        if (state.selectedValue == value) {
            clearSelection();
        }
        resetFilter();
        manageTooltip();
        if (state.config.autoFill && state.data.length > 0) {
            const firstItem = state.data[0];
            setValue(firstItem[state.config.valueField], firstItem[state.config.textField]);
        } else if (state.data.length > 0) {
            state.selectedValue = state.data[0][state.config.valueField];
            populateOptions();
        }
    }

    function udp(value, newItem) {
        const index = state.data.findIndex(item => item[state.config.valueField] == value);
        if (index !== -1) {
            state.data[index] = { ...state.data[index], ...newItem };
            resetFilter();
            manageTooltip();
            if (state.selectedValue == value) {
                setValue(value, newItem[state.config.textField] || state.comboBoxInput.value);
            }
        }
    }

    function set(value) {
        const item = state.data.find(item => item[state.config.valueField] == value);
        if (item) {
            setValue(item[state.config.valueField], item[state.config.textField]);
        }
    }

    function getAll() {
        return state.data;
    }

    function disable() {
        state.disabled = true;
        state.comboBoxInput.setAttribute('disabled', 'true');
        state.dropdownButton.setAttribute('disabled', 'true');
        state.clearButton.setAttribute('disabled', 'true');
    }

    function enable() {
        state.disabled = false;
        state.comboBoxInput.removeAttribute('disabled');
        state.dropdownButton.removeAttribute('disabled');
        state.clearButton.removeAttribute('disabled');
    }

    init();

    return {
        add,         // Agrega un elemento al ComboBox
        del,         // Elimina un elemento del ComboBox
        disable,     // Deshabilita el ComboBox
        enable,      // Habilita el ComboBox
        get,         // Obtiene el valor seleccionado
        getAll,      // Obtiene todos los datos
        set,         // Establece un valor seleccionado
        udp          // Actualiza un elemento en el ComboBox
    };
}

window.getComboBoxInstance = function (controlID) {
    return comboBoxInstances[controlID];
};

window.getCb = function (controlID) {
    return comboBoxInstances[controlID];
};

export default ComboBox;
