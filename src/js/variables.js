
var ids = ['draw', 'text', 'rect', 'circle', 'group', 'ungroup',
    'clear_canvas', 'save', 'images', 'dots_pattern', 'context_menu',
    'copy', 'paste', 'delete', 'cursor', 'active_object', 'arrow',
    'stroke_width', 'plus_stroke_width', 'minus_stroke_width', 'opacity_fill',
    'fill_picker', 'stroke_picker', 'width_value', 'height_value', 'position_x_value',
    'position_y_value', 'target_param', 'save_canvas', 'properties_active_object',
    'right_menu', 'menu', 'canvas_has_object', 'canvas_option', 'fill_value', 'zoom_value',
    'treangle', 'rhombus', 'step_forward', 'step_back', 'font_size_value', "font_size_plus",
    "font_size_minus", 'delete_icon', 'text_menu', 'menu', 'text_color_picker',
];

var elements = ids.reduce((acc, id) => {
    acc[id] = document.getElementById(id);
    return acc;
}, {});

document.addEventListener('click', (e) => {
    if (e.target != elements.context_menu) {
        if (elements.context_menu.classList.contains('visible')) {
            elements.context_menu.classList.remove('visible');
        }
    }
})

export { elements };


//Всплывающие подсказки.

var tolltip = document.createElement('div');
tolltip.classList.add('tooltip');
tolltip.setAttribute('id', 'tolltip')
var images = document.getElementsByClassName('primary_shape');


elements.menu.addEventListener('mouseover', function (event) {
    let hoveredElement = event.target; // Элемент, на который навели мышкой

    if (hoveredElement.classList != 'primary'
        && hoveredElement.classList != 'menu') {

        //Координаты элемента
        const left = hoveredElement.getBoundingClientRect().x;
        const top = hoveredElement.getBoundingClientRect().y;

        
        if (hoveredElement.id === 'shape') {
            hoveredElement.addEventListener('mouseleave', removeShapeImg);
            Array.from(images).forEach((element) => {
                element.style.display = 'flex';
            })
        }

    }

});


elements.menu.onmouseleave = function (event) {
    tolltip.classList.remove('tooltip_right');
    tolltip.remove();
    
}

function removeShapeImg() {
    Array.from(images).forEach((element) => {
        element.style.display = 'none';
    })
}


export var shapeMenu = document.createElement('div');

//Collor-picker для фигур
export var shapeFillPicker = document.createElement('toolcool-color-picker');
shapeFillPicker.setAttribute('button-width', 'lg');
shapeFillPicker.setAttribute('button-height', 'lg');
shapeFillPicker.setAttribute('button-padding', '2px');
shapeFillPicker.setAttribute('color', '#000000');
shapeFillPicker.setAttribute('popup-position', 'right');
shapeFillPicker.setAttribute('z-index', '999');
shapeFillPicker.setAttribute('id', 'shape_fill_picker');

//Блок Size с размерами фигуры

// Create main div
export var sizeDiv = document.createElement("div");
sizeDiv.className = "size";

// Create width div
export var widthDiv = document.createElement("div");
widthDiv.className = "width";

// Create width label
export var widthLabel = document.createElement("div");
widthLabel.className = "active_object_context";
widthLabel.textContent = "W : ";

// Create width value
export var widthValue = document.createElement("div");
widthValue.id = "width_value";
widthValue.className = "active_object_context";

// Append width label and value to width div
widthDiv.appendChild(widthLabel);
widthDiv.appendChild(widthValue);

// Create height div
export var heightDiv = document.createElement("div");
heightDiv.className = "height";

// Create height label
export var heightLabel = document.createElement("div");
heightLabel.className = "active_object_context";
heightLabel.textContent = "H : ";

// Create height value
export var heightValue = document.createElement("div");
heightValue.id = "height_value";
heightValue.className = "active_object_context";

// Append height label and value to height div
heightDiv.appendChild(heightLabel);
heightDiv.appendChild(heightValue);

// Append width and height divs to main div
sizeDiv.appendChild(widthDiv);
sizeDiv.appendChild(heightDiv);


document.addEventListener('DOMContentLoaded', function () {
    // проверяем есть ли элемент
    shapeMenu.setAttribute('id', 'shape_menu');
    shapeMenu.classList.add('shape_menu');
    document.body.appendChild(shapeMenu);
    shapeMenu.appendChild(shapeFillPicker);
    shapeMenu.appendChild(sizeDiv);
});


















