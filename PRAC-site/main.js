document.addEventListener("DOMContentLoaded", () => {
  const DRIVERS_STORAGE_KEY = "quoteDrivers";
  const VEHICLES_STORAGE_KEY = "quoteVehicles";
  const PENDING_SPOUSE_KEY = "pendingSpouseDriver";
  const EDITING_DRIVER_KEY = "editingDriverId";
  const EDITING_VEHICLE_KEY = "editingVehicleId";
  const nextForms = document.querySelectorAll("form[data-next-page]");
  const backButtons = document.querySelectorAll("[data-go-back]");
  const goToButtons = document.querySelectorAll("[data-go-to]");
  const spouseToggles = document.querySelectorAll("[data-spouse-toggle]");
  const driverCards = document.querySelector("[data-driver-cards]");
  const driverTemplate = document.querySelector("#driver-card-template");
  const addDriverButton = document.querySelector("[data-add-driver-page]");
  const driverEditorForm = document.querySelector("[data-driver-editor-form]");
  const addVehicleButton = document.querySelector("[data-add-vehicle-page]");
  const editVehicleButtons = document.querySelectorAll("[data-edit-vehicle-id]");
  const vehicleEditorForm = document.querySelector("[data-vehicle-editor-form]");
  const vehicleCards = document.querySelector("[data-vehicle-cards]");
  const vehicleTemplate = document.querySelector("#vehicle-card-template");
  const quoteSelectionForm = document.querySelector("[data-quote-selection-form]");
  const viewQuoteButton = document.querySelector("[data-view-quote]");
  const quoteOptionCards = document.querySelectorAll("[data-quote-option-card]");

  const defaultDrivers = [
    {
      id: "family-member-1",
      name: "Family Member 1",
      birthDate: "**/**/1946",
      editable: false,
    },
    {
      id: "family-member-2",
      name: "Family Member 2",
      birthDate: "**/**/1946",
      editable: true,
    },
  ];

  const defaultVehicles = [
    {
      id: "vehicle-1",
      year: "2019",
      make: "Vehicle Make",
      model: "Vehicle Model",
      vin: "1234ABCD1234ABCD1",
    },
    {
      id: "vehicle-2",
      year: "2020",
      make: "Vehicle Make",
      model: "Vehicle Model",
      vin: "ABCD1234ABCD12342",
    },
  ];

  const vehicleDataset = [
    { id: "vehicle-1", year: "2019", make: "Dodge", model: "Durango" },
    { id: "vehicle-2", year: "2020", make: "Toyota", model: "Camry" },
    { id: "vehicle-3", year: "2021", make: "Honda", model: "Civic" },
    { id: "vehicle-4", year: "2022", make: "Subaru", model: "Outback" },
    { id: "vehicle-5", year: "2023", make: "Hyundai", model: "Tucson" },
  ];

  const readStoredDrivers = () => {
    const rawDrivers = window.localStorage.getItem(DRIVERS_STORAGE_KEY);

    if (!rawDrivers) {
      return [...defaultDrivers];
    }

    try {
      const parsedDrivers = JSON.parse(rawDrivers);
      return Array.isArray(parsedDrivers) ? parsedDrivers : [...defaultDrivers];
    } catch {
      return [...defaultDrivers];
    }
  };

  const writeStoredDrivers = (drivers) => {
    window.localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
  };

  const readStoredVehicles = () => {
    const rawVehicles = window.localStorage.getItem(VEHICLES_STORAGE_KEY);

    if (!rawVehicles) {
      return [...defaultVehicles];
    }

    try {
      const parsedVehicles = JSON.parse(rawVehicles);
      return Array.isArray(parsedVehicles) ? parsedVehicles : [...defaultVehicles];
    } catch {
      return [...defaultVehicles];
    }
  };

  const writeStoredVehicles = (vehicles) => {
    window.localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  };

  const createDriverId = () => `driver-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createVehicleId = () => `vehicle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const readPendingSpouse = () => {
    const rawSpouse = window.localStorage.getItem(PENDING_SPOUSE_KEY);

    if (!rawSpouse) {
      return null;
    }

    try {
      return JSON.parse(rawSpouse);
    } catch {
      return null;
    }
  };

  nextForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nextPage = form.getAttribute("data-next-page");
      const maritalStatus = form.querySelector("[data-marital-status]");
      const spouseSection = form.querySelector("[data-spouse-section]");
      const spouseFirstName = form.querySelector("[data-spouse-first-name]");
      const spouseLastName = form.querySelector("[data-spouse-last-name]");
      const spouseBirthDate = form.querySelector("[data-spouse-birth-date]");

      if (maritalStatus && spouseSection && spouseFirstName && spouseLastName && spouseBirthDate) {
        const spouseIsVisible = !spouseSection.hidden;
        const firstName = spouseFirstName.value.trim();
        const lastName = spouseLastName.value.trim();
        const birthDate = spouseBirthDate.value.trim();

        if (spouseIsVisible && firstName && lastName && birthDate) {
          window.localStorage.setItem(
            PENDING_SPOUSE_KEY,
            JSON.stringify({
              id: "spouse-driver",
              name: `${firstName} ${lastName}`,
              birthDate,
              editable: true,
            })
          );
        } else {
          window.localStorage.removeItem(PENDING_SPOUSE_KEY);
          writeStoredDrivers(
            readStoredDrivers().filter((driver) => driver.id !== "spouse-driver")
          );
        }
      }

      if (nextPage) {
        window.location.href = nextPage;
      }
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const previousPage = button.getAttribute("data-go-back");

      if (driverEditorForm) {
        window.localStorage.removeItem(EDITING_DRIVER_KEY);
      }

      if (vehicleEditorForm) {
        window.localStorage.removeItem(EDITING_VEHICLE_KEY);
      }

      if (previousPage) {
        window.location.href = previousPage;
      }
    });
  });

  if (addVehicleButton instanceof HTMLButtonElement) {
    addVehicleButton.addEventListener("click", () => {
      window.localStorage.removeItem(EDITING_VEHICLE_KEY);
      window.location.href = "./add-vehicle.html";
    });
  }

  editVehicleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const vehicleId = button.getAttribute("data-edit-vehicle-id");
      if (vehicleId) {
        window.localStorage.setItem(EDITING_VEHICLE_KEY, vehicleId);
      }
      window.location.href = "./add-vehicle.html";
    });
  });

  if (vehicleCards && vehicleTemplate instanceof HTMLTemplateElement) {
    let vehicles = readStoredVehicles();
    writeStoredVehicles(vehicles);

    const renderVehicles = () => {
      vehicleCards.querySelectorAll("[data-vehicle-card]").forEach((card) => card.remove());

      vehicles.forEach((vehicle) => {
        const fragment = vehicleTemplate.content.cloneNode(true);
        const card = fragment.querySelector("[data-vehicle-card]");
        const title = fragment.querySelector("h2");
        const vin = fragment.querySelector("p");
        const editButton = fragment.querySelector("[data-edit-vehicle]");
        const deleteButton = fragment.querySelector("[data-delete-vehicle]");

        if (!card || !title || !vin || !editButton || !deleteButton) return;

        card.setAttribute("data-vehicle-id", vehicle.id);
        title.textContent = `${vehicle.year} ${vehicle.make}, ${vehicle.model}`;
        vin.textContent = `VIN: ${vehicle.vin}`;

        editButton.addEventListener("click", () => {
          window.localStorage.setItem(EDITING_VEHICLE_KEY, vehicle.id);
          window.location.href = "./add-vehicle.html";
        });

        deleteButton.addEventListener("click", () => {
          vehicles = vehicles.filter((entry) => entry.id !== vehicle.id);
          writeStoredVehicles(vehicles);
          renderVehicles();
        });

        vehicleCards.insertBefore(fragment, vehicleCards.querySelector(".driver-card--add"));
      });
    };

    renderVehicles();
  }

  goToButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextPage = button.getAttribute("data-go-to");

      if (nextPage) {
        window.location.href = nextPage;
      }
    });
  });

  spouseToggles.forEach((select) => {
    const form = select.closest("form");
    const spouseSection = form?.querySelector("[data-spouse-section]");

    if (!spouseSection) return;

    const syncSpouseVisibility = () => {
      spouseSection.hidden =
        select.value === "Single" ||
        select.value === "Widowed" ||
        select.value === "Separated/Divorced";
    };

    syncSpouseVisibility();
    select.addEventListener("change", syncSpouseVisibility);
  });

  if (driverCards && driverTemplate instanceof HTMLTemplateElement) {
    let drivers = readStoredDrivers();
    const pendingSpouse = readPendingSpouse();

    if (pendingSpouse) {
      drivers = drivers.filter((driver) => driver.id !== pendingSpouse.id);
      drivers.push(pendingSpouse);
      window.localStorage.removeItem(PENDING_SPOUSE_KEY);
    }

    writeStoredDrivers(drivers);

    if (addDriverButton instanceof HTMLButtonElement) {
      addDriverButton.addEventListener("click", () => {
        window.localStorage.removeItem(EDITING_DRIVER_KEY);
        window.location.href = "./add-driver.html";
      });
    }

    const renderDrivers = () => {
      driverCards.querySelectorAll("[data-driver-card]").forEach((card) => card.remove());

      drivers.forEach((driver) => {
        const fragment = driverTemplate.content.cloneNode(true);
        const card = fragment.querySelector(".driver-card");
        const name = fragment.querySelector("h2");
        const birthDate = fragment.querySelector("p");
        const editButton = fragment.querySelector(".driver-card__action--edit");
        const deleteButton = fragment.querySelector("[data-delete-driver]");

        if (!card || !name || !birthDate || !deleteButton) return;

        card.setAttribute("data-driver-card", "true");
        card.setAttribute("data-driver-id", driver.id);
        name.textContent = driver.name;
        birthDate.textContent = driver.birthDate;

        if (!driver.editable && editButton) {
          editButton.remove();
        } else if (editButton) {
          editButton.addEventListener("click", () => {
            window.localStorage.setItem(EDITING_DRIVER_KEY, driver.id);
            window.location.href = "./add-driver.html";
          });
        }

        deleteButton.addEventListener("click", () => {
          drivers = drivers.filter((entry) => entry.id !== driver.id);
          writeStoredDrivers(drivers);
          renderDrivers();
        });

        driverCards.insertBefore(fragment, driverCards.querySelector(".driver-card--add"));
      });
    };

    renderDrivers();
  }

  if (driverEditorForm instanceof HTMLFormElement) {
    const drivers = readStoredDrivers();
    const editingDriverId = window.localStorage.getItem(EDITING_DRIVER_KEY);
    const editingDriver = drivers.find((driver) => driver.id === editingDriverId);
    const title = document.querySelector("[data-driver-form-title]");
    const firstNameInput = driverEditorForm.querySelector("[data-driver-editor-first-name]");
    const lastNameInput = driverEditorForm.querySelector("[data-driver-editor-last-name]");
    const birthDateInput = driverEditorForm.querySelector("[data-driver-editor-birth-date]");
    const maritalStatusInput = driverEditorForm.querySelector("[data-driver-editor-marital-status]");
    const genderInputs = driverEditorForm.querySelectorAll("[data-driver-editor-gender]");

    if (editingDriver) {
      const [firstName = "", ...lastNameParts] = editingDriver.name.split(" ");
      if (title) {
        title.textContent = "Edit driver";
      }
      if (firstNameInput instanceof HTMLInputElement) {
        firstNameInput.value = firstName;
      }
      if (lastNameInput instanceof HTMLInputElement) {
        lastNameInput.value = lastNameParts.join(" ");
      }
      if (birthDateInput instanceof HTMLInputElement) {
        birthDateInput.value = editingDriver.birthDate || "";
      }
      if (maritalStatusInput instanceof HTMLSelectElement) {
        maritalStatusInput.value = editingDriver.maritalStatus || "Select";
      }
      genderInputs.forEach((input) => {
        if (input instanceof HTMLInputElement && input.value === editingDriver.gender) {
          input.checked = true;
        }
      });
    }

    driverEditorForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const firstName = firstNameInput instanceof HTMLInputElement ? firstNameInput.value.trim() : "";
      const lastName = lastNameInput instanceof HTMLInputElement ? lastNameInput.value.trim() : "";
      const birthDate = birthDateInput instanceof HTMLInputElement ? birthDateInput.value.trim() : "";
      const maritalStatus =
        maritalStatusInput instanceof HTMLSelectElement ? maritalStatusInput.value : "Select";
      const gender =
        Array.from(genderInputs).find(
          (input) => input instanceof HTMLInputElement && input.checked
        )?.value || "";

      if (!firstName || !lastName || !birthDate) {
        return;
      }

      const driverRecord = {
        id: editingDriver?.id || createDriverId(),
        name: `${firstName} ${lastName}`,
        birthDate,
        editable: true,
        maritalStatus,
        gender,
      };

      const nextDrivers = editingDriver
        ? drivers.map((driver) => (driver.id === editingDriver.id ? driverRecord : driver))
        : [...drivers, driverRecord];

      writeStoredDrivers(nextDrivers);
      window.localStorage.removeItem(EDITING_DRIVER_KEY);
      window.location.href = "./drivers.html";
    });
  }

  if (vehicleEditorForm instanceof HTMLFormElement) {
    const editingVehicleId = window.localStorage.getItem(EDITING_VEHICLE_KEY);
    const vehicleTitle = document.querySelector("[data-vehicle-form-title]");
    const yearInput = vehicleEditorForm.querySelector("[data-vehicle-editor-year]");
    const makeInput = vehicleEditorForm.querySelector("[data-vehicle-editor-make]");
    const modelInput = vehicleEditorForm.querySelector("[data-vehicle-editor-model]");
    const yearList = document.querySelector("#vehicle-year-options");
    const makeList = document.querySelector("#vehicle-make-options");
    const modelList = document.querySelector("#vehicle-model-options");
    const storedVehicles = readStoredVehicles();
    const combinedVehicleDataset = [...vehicleDataset, ...storedVehicles];
    const editingVehicle = storedVehicles.find((vehicle) => vehicle.id === editingVehicleId);

    const setDatalistOptions = (datalist, values) => {
      if (!(datalist instanceof HTMLDataListElement)) return;
      datalist.innerHTML = "";
      [...new Set(values)].forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        datalist.appendChild(option);
      });
    };

    const syncVehicleAutocomplete = () => {
      const selectedYear = yearInput instanceof HTMLInputElement ? yearInput.value.trim() : "";
      const selectedMake = makeInput instanceof HTMLInputElement ? makeInput.value.trim() : "";
      const selectedModel = modelInput instanceof HTMLInputElement ? modelInput.value.trim() : "";

      const modelMatches = combinedVehicleDataset.filter((vehicle) => {
        const yearMatches = !selectedYear || vehicle.year === selectedYear;
        const makeMatchesFilter = !selectedMake || vehicle.make === selectedMake;
        return yearMatches && makeMatchesFilter;
      });

      const allYears = combinedVehicleDataset.map((vehicle) => vehicle.year);
      const allMakes = combinedVehicleDataset
        .filter((vehicle) => !selectedYear || vehicle.year === selectedYear)
        .map((vehicle) => vehicle.make);
      const allModels = modelMatches.map((vehicle) => vehicle.model);

      setDatalistOptions(yearList, allYears);
      setDatalistOptions(makeList, allMakes);
      setDatalistOptions(modelList, allModels);

      const exactVehicle = combinedVehicleDataset.find((vehicle) => {
        const yearMatches = !selectedYear || vehicle.year === selectedYear;
        const makeMatchesFilter = !selectedMake || vehicle.make === selectedMake;
        const modelMatchesFilter = !selectedModel || vehicle.model === selectedModel;
        return yearMatches && makeMatchesFilter && modelMatchesFilter;
      });

      if (
        exactVehicle &&
        yearInput instanceof HTMLInputElement &&
        makeInput instanceof HTMLInputElement &&
        modelInput instanceof HTMLInputElement
      ) {
        if (selectedYear && selectedMake && !selectedModel) {
          modelInput.value = exactVehicle.model;
        }
        if (selectedYear && !selectedMake) {
          makeInput.value = exactVehicle.make;
        }
        if (selectedMake && !selectedYear) {
          yearInput.value = exactVehicle.year;
        }
      }
    };

    if (editingVehicleId && vehicleTitle) {
      vehicleTitle.textContent = "Edit a vehicle.";
    }

    if (editingVehicle) {
      if (yearInput instanceof HTMLInputElement) yearInput.value = editingVehicle.year;
      if (makeInput instanceof HTMLInputElement) makeInput.value = editingVehicle.make;
      if (modelInput instanceof HTMLInputElement) modelInput.value = editingVehicle.model;
    }

    syncVehicleAutocomplete();

    [yearInput, makeInput, modelInput].forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.addEventListener("input", syncVehicleAutocomplete);
        input.addEventListener("change", syncVehicleAutocomplete);
      }
    });

    vehicleEditorForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const year = yearInput instanceof HTMLInputElement ? yearInput.value.trim() : "";
      const make = makeInput instanceof HTMLInputElement ? makeInput.value.trim() : "";
      const model = modelInput instanceof HTMLInputElement ? modelInput.value.trim() : "";

      if (!year || !make || !model) {
        return;
      }

      const matchingDatasetVehicle = combinedVehicleDataset.find(
        (vehicle) => vehicle.year === year && vehicle.make === make && vehicle.model === model
      );

      const vehicleRecord = {
        id: editingVehicle?.id || createVehicleId(),
        year,
        make,
        model,
        vin:
          editingVehicle?.vin ||
          matchingDatasetVehicle?.vin ||
          `VIN${Math.random().toString(36).slice(2, 14).toUpperCase()}`,
      };

      const nextVehicles = editingVehicle
        ? storedVehicles.map((vehicle) => (vehicle.id === editingVehicle.id ? vehicleRecord : vehicle))
        : [...storedVehicles, vehicleRecord];

      writeStoredVehicles(nextVehicles);
      window.localStorage.removeItem(EDITING_VEHICLE_KEY);
      window.location.href = "./vehicles.html";
    });
  }

  if (quoteSelectionForm instanceof HTMLFormElement && viewQuoteButton instanceof HTMLButtonElement) {
    quoteOptionCards.forEach((card) => {
      card.addEventListener("click", () => {
        const radio = card.querySelector('input[name="quote-package"]');

        if (radio instanceof HTMLInputElement) {
          radio.checked = true;
        }
      });
    });

    quoteSelectionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const selectedPackage = quoteSelectionForm.querySelector('input[name="quote-package"]:checked');

      if (!(selectedPackage instanceof HTMLInputElement)) {
        return;
      }

      if (selectedPackage.value === "maximum-savings") {
        window.location.href = "./quote-maximum-savings.html";
      }
    });
  }

  const quoteResults = document.querySelector("[data-quote-results]");

  if (quoteResults) {
    const packageTabs = quoteResults.querySelectorAll("[data-quote-package-tab]");
    const packagePanels = quoteResults.querySelectorAll("[data-quote-package-panel]");
    const packageSummaries = quoteResults.querySelectorAll("[data-quote-package-summary]");

    const syncQuotePackage = (selectedPackage) => {
      packageTabs.forEach((tab) => {
        if (!(tab instanceof HTMLButtonElement)) {
          return;
        }

        const isActive = tab.getAttribute("data-quote-package-tab") === selectedPackage;
        tab.classList.toggle("quote-results__tab--active", isActive);
        tab.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      packagePanels.forEach((panel) => {
        if (!(panel instanceof HTMLElement)) {
          return;
        }

        panel.hidden = panel.getAttribute("data-quote-package-panel") !== selectedPackage;
      });

      packageSummaries.forEach((summary) => {
        if (!(summary instanceof HTMLElement)) {
          return;
        }

        summary.hidden = summary.getAttribute("data-quote-package-summary") !== selectedPackage;
      });
    };

    packageTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const selectedPackage = tab.getAttribute("data-quote-package-tab");

        if (!selectedPackage) {
          return;
        }

        syncQuotePackage(selectedPackage);
      });
    });
  }

  const coverageDatePicker = document.querySelector("[data-coverage-date-picker]");

  if (coverageDatePicker) {
    const trigger = coverageDatePicker.querySelector("[data-coverage-date-trigger]");
    const overlay = coverageDatePicker.querySelector("[data-coverage-date-overlay]");
    const input = coverageDatePicker.querySelector("[data-coverage-date-input]");
    const coverageNote = document.querySelector("[data-coverage-note]");
    const label = coverageDatePicker.querySelector("[data-coverage-date-label]");
    const grid = coverageDatePicker.querySelector("[data-coverage-date-grid]");
    const previousMonthButton = coverageDatePicker.querySelector("[data-coverage-date-prev]");
    const nextMonthButton = coverageDatePicker.querySelector("[data-coverage-date-next]");

    if (
      trigger instanceof HTMLElement &&
      overlay instanceof HTMLDivElement &&
      input instanceof HTMLInputElement &&
      label instanceof HTMLParagraphElement &&
      grid instanceof HTMLDivElement &&
      previousMonthButton instanceof HTMLButtonElement &&
      nextMonthButton instanceof HTMLButtonElement
    ) {
      const parseStoredDate = (value) => {
        if (!value) return null;

        const [month, day, year] = value.split("/");

        if (!month || !day || !year) {
          return null;
        }

        return new Date(Number(year), Number(month) - 1, Number(day));
      };

      const today = new Date();
      const selectedDate = parseStoredDate(input.value);
      let visibleMonth = selectedDate
        ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        : new Date(today.getFullYear(), today.getMonth(), 1);

      const formatDateValue = (date) =>
        `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;

      const isSameDate = (firstDate, secondDate) =>
        firstDate &&
        secondDate &&
        firstDate.getFullYear() === secondDate.getFullYear() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getDate() === secondDate.getDate();

      if (coverageNote) {
        const advanceShopperDate = new Date(today);
        advanceShopperDate.setDate(advanceShopperDate.getDate() + 7);
        const formattedAdvanceShopperDate = `${String(advanceShopperDate.getMonth() + 1).padStart(2, "0")}/${String(advanceShopperDate.getDate()).padStart(2, "0")}`;
        coverageNote.textContent = `You may receive an Advance Shopper Discount when you start your policy ${formattedAdvanceShopperDate} or later.`;
      }

      const openOverlay = () => {
        overlay.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        trigger.classList.add("coverage-date-field--open");
      };

      const closeOverlay = () => {
        overlay.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        trigger.classList.remove("coverage-date-field--open");
      };

      const renderCalendar = () => {
        label.textContent = visibleMonth.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        grid.innerHTML = "";

        const firstDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
        const calendarStart = new Date(firstDayOfMonth);
        calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());

        for (let index = 0; index < 42; index += 1) {
          const date = new Date(calendarStart);
          date.setDate(calendarStart.getDate() + index);

          const dayButton = document.createElement("button");
          dayButton.type = "button";
          dayButton.className = "coverage-date-overlay__day";
          dayButton.textContent = String(date.getDate());
          dayButton.setAttribute("aria-label", date.toLocaleDateString("en-US"));

          if (date.getMonth() !== visibleMonth.getMonth()) {
            dayButton.classList.add("coverage-date-overlay__day--muted");
          }

          if (isSameDate(date, today)) {
            dayButton.classList.add("coverage-date-overlay__day--today");
          }

          const currentSelectedDate = parseStoredDate(input.value);

          if (isSameDate(date, currentSelectedDate)) {
            dayButton.classList.add("coverage-date-overlay__day--selected");
          }

          dayButton.addEventListener("click", () => {
            input.value = formatDateValue(date);
            renderCalendar();
            closeOverlay();
          });

          grid.appendChild(dayButton);
        }
      };

      renderCalendar();

      const toggleOverlay = () => {
        const isOpen = !overlay.hidden;

        if (isOpen) {
          closeOverlay();
        } else {
          renderCalendar();
          openOverlay();
        }
      };

      trigger.addEventListener("click", toggleOverlay);
      trigger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleOverlay();
        }
      });

      previousMonthButton.addEventListener("click", () => {
        visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
        renderCalendar();
      });

      nextMonthButton.addEventListener("click", () => {
        visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
        renderCalendar();
      });

      document.addEventListener("click", (event) => {
        if (!coverageDatePicker.contains(event.target)) {
          closeOverlay();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeOverlay();
        }
      });
    }
  }
});
