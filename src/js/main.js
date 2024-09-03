// Imports
//=require jquery/dist/jquery.min.js

document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.accordion-toggle');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.querySelector(targetId);

            if (targetElement.classList.contains('show')) {
                // Close the target element
                targetElement.classList.remove('show');
                targetElement.style.height = '0'; // Collapse height to 0
                setTimeout(() => {
                    targetElement.classList.remove('collapse');
                    targetElement.style.display = 'none'; // Hide after transition
                }, 300); // Match this with the transition duration

                // Update button state
                this.classList.add('collapsed');
            } else {
                // Open the target element
                targetElement.classList.add('collapse');
                targetElement.style.display = 'block';
                // Trigger reflow to apply transition
                targetElement.offsetHeight; // Trigger reflow
                targetElement.classList.add('show');
                targetElement.style.height = targetElement.scrollHeight + 'px'; // Set height to the content height

                // Update button state
                this.classList.remove('collapsed');
            }
        });
    });

    // SELECT DROPDOWN
    const dropdown = document.querySelector('.dropdown');
    const button = dropdown.querySelector('.dropdown-button');
    const content = dropdown.querySelector('.dropdown-content');

    button.addEventListener('click', () => {
        const isVisible = content.classList.toggle('show-content');
        button.classList.toggle('show', isVisible);
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            content.classList.remove('show-content');
            button.classList.remove('show');
        }
    });

    // TABS
    const tabContainers = document.querySelectorAll('.navigation-tabs');

    tabContainers.forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabPanes = container.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTabId = button.getAttribute('data-tab');

                // Elimina la clase activa de todos los botones y panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // Añade la clase activa al botón y al pane correspondiente
                button.classList.add('active');
                const targetPane = container.querySelector(`#${targetTabId}`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    });

    // TOOLTIP
    const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');

    tooltipTriggers.forEach(trigger => {
        const tooltipContainer = trigger.parentElement;
        const tooltipContent = tooltipContainer.querySelector('.tooltip-content');

        // Mostrar el tooltip al pasar el mouse
        trigger.addEventListener('mouseover', () => {
            tooltipContent.style.visibility = 'visible';
            tooltipContent.style.opacity = '1';
        });

        // Ocultar el tooltip al quitar el mouse, si el mouse no está sobre el tooltip
        trigger.addEventListener('mouseout', () => {
            if (!tooltipContent.matches(':hover')) {
                tooltipContent.style.visibility = 'hidden';
                tooltipContent.style.opacity = '0';
            }
        });

        // Mostrar el tooltip cuando se hace clic en el trigger
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Previene que el clic cierre el tooltip inmediatamente
            tooltipContent.style.visibility = 'visible';
            tooltipContent.style.opacity = '1';
        });

        // Ocultar el tooltip cuando se hace clic fuera
        const closeTooltip = (e) => {
            if (!tooltipContainer.contains(e.target)) {
                tooltipContent.style.visibility = 'hidden';
                tooltipContent.style.opacity = '0';
            }
        };

        document.addEventListener('click', closeTooltip);
    });
});



// Datos de ejemplo
const barsData = [
    { id: 'bar1', percentageId: 'percentage1', amount: 13615.22 },
    { id: 'bar2', percentageId: 'percentage2', amount: 5879.32 },
    { id: 'bar3', percentageId: 'percentage3', amount: 5879.32 },
    { id: 'bar4', percentageId: 'percentage4', amount: 5879.32 },
    { id: 'bar5', percentageId: 'percentage5', amount: 11448.56 }
];

// Calcular el monto total
const totalAmount = barsData.reduce((total, item) => total + item.amount, 0);

// Calcular los porcentajes
const percentages = barsData.map(item => {
    const percentage = (item.amount / totalAmount) * 100;
    return {
        id: item.id,
        percentageId: item.percentageId,
        percentage: percentage
    };
});

// Redondear y ajustar porcentajes para que sumen exactamente 100%
let totalPercentage = percentages.reduce((total, item) => total + item.percentage, 0);
const adjustedPercentages = percentages.map(item => {
    const adjustedPercentage = Math.floor(item.percentage);
    return {
        id: item.id,
        percentageId: item.percentageId,
        percentage: adjustedPercentage
    };
});

// Recalcular el porcentaje total
totalPercentage = adjustedPercentages.reduce((total, item) => total + item.percentage, 0);

// Ajustar el primer elemento para que el total sea exactamente 100%
if (totalPercentage < 100) {
    adjustedPercentages[0].percentage += (100 - totalPercentage);
}

// Función para animar las barras de progreso
function animateBars(data) {
    data.forEach((dataItem, index) => {
        const barElement = document.getElementById(dataItem.id);
        const fillElement = barElement.querySelector('.fill');
        const percentageElement = document.getElementById(dataItem.percentageId);

        if (fillElement && percentageElement) {
            // Actualizar el porcentaje y el contenido del span
            percentageElement.textContent = `${Math.round(dataItem.percentage)}%`;

            // Animar el ancho de la barra de llenado
            // Añadir un retraso para asegurar que la animación se aplique secuencialmente
            setTimeout(() => {
                fillElement.style.width = `${dataItem.percentage}%`;
            }, index * 500); // Retraso incremental basado en el índice
        }
    });
}

// Iniciar animación de barras después de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    animateBars(adjustedPercentages);
});