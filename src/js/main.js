import '../scss/style.scss';
import '../scss/right-menu.scss';
import '../scss/menu.scss';
import '../scss/text-menu.scss';
import '../scss/shape-menu.scss';
import { fabric } from 'fabric';
import 'fabric-history';
import { elements, shapeFillPicker, shapeMenu, heightValue, widthValue } from './variables';


// буфер обмена для copy paste
var _clipboard;
var currentCollor = '#000000';
var currentDrawWidth = 10;
// Координаты context меню во время вызова
var contextMenuClick = {
    x: 0,
    y: 0
}

// Создаём новый канвас fabric
const canvas = new fabric.Canvas('canvas', {
    width: window.innerWidth,
    // backgroundColor: '#e6f7ea', //'#f5f5f5'
    height: window.innerHeight,
    stateful: true,
    imageSmoothingEnabled: true,

});




function createSvgBackground() {
    var width = canvas.getWidth();
    var height = canvas.getHeight();
    // Создаем SVG-элемент
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // Создаем круги
    for (var i = 20; i < width; i += 48) {
        for (var j = 10; j < height; j += 48) {
            var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", i);
            circle.setAttribute("cy", j);
            circle.setAttribute("r", 1);
            circle.setAttribute("opacity", 1)
            circle.setAttribute("fill", "#aaabac");
            circle.setAttribute('imageSmoothing', 'true');
            svg.appendChild(circle);
        }
    }

    // Преобразуем SVG в строку и загружаем его как фон холста
    var svgString = new XMLSerializer().serializeToString(svg);
    var svgDataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);

    // Устанавливаем фоновое изображение с помощью CSS, а не с помощью Fabric.js
    canvas.getElement().style.backgroundImage = 'url(' + svgDataUrl + ')';

}

//реагируем на изменение размеров canvas
window.addEventListener('resize', resizeCanvas)

function resizeCanvas() {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.calcOffset();
    createSvgBackground(canvas);
    canvas.renderAll();
}

window.addEventListener('DOMContentLoaded', createSvgBackground)

//Отключает кеширование обьектов что влияет на детализацию
fabric.Object.prototype.objectCaching = false;


fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = '#7a7AF4';
fabric.Object.prototype.cornerSize = 10;
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.centeredRotation = true;


fabric.Object.prototype.centeredScaling = false;
fabric.Object.prototype.centeredScaling = false;
fabric.Object.prototype.centeredRotation = true;


//Действия кнопок контекстного меню
elements.group.addEventListener('click', groupObject);
elements.ungroup.addEventListener('click', ungroupObject);
elements.save.addEventListener('click', saveObject);
elements.copy.addEventListener('click', cloneObject);
elements.paste.addEventListener('click', pasteObject);
elements.step_back.addEventListener('click', stepBack);
elements.step_forward.addEventListener('click', stepForward);
elements.draw.addEventListener('click', draw);
elements.cursor.addEventListener('click', stopDraw);
elements.font_size_plus.addEventListener('click', fontPlus);
elements.font_size_minus.addEventListener('click', fontMinus);
elements.delete_icon.addEventListener('click', deleteObject);
elements.arrow.addEventListener('click', drawArrow);
elements.text.addEventListener('click', addText);
elements.rect.addEventListener('click', addRect);
elements.circle.addEventListener('click', addCircle);
elements.treangle.addEventListener('click', addTriangle);
elements.rhombus.addEventListener('click', addRhombus);

elements.text_color_picker.addEventListener('change', changeColorText);
elements.fill_picker.addEventListener('change', changeFill);
elements.stroke_picker.addEventListener('change', changeStroke);
elements.plus_stroke_width.addEventListener('click', plusStrokeWidth);
elements.minus_stroke_width.addEventListener('click', minusStrokeWidth);
elements.stroke_width.addEventListener('change', inputStrokeWidth);
elements.delete.addEventListener('click', deleteObject);
elements.clear_canvas.addEventListener('click', clearCanvas);
elements.save_canvas.addEventListener('click', saveCanvas);
shapeFillPicker.addEventListener('change', changeFill);

//КЛИК ПО КАНВАСУ
canvas.on('mouse:down', leftClick);

// Отмена последнего действия
document.addEventListener('keydown', function (e) {
    // Проверяем, нажата ли клавиша Ctrl+Z
    if (e.ctrlKey === true) {
        if (e.key === 'z' || e.key === 'Z') {
            // Вызываем метод undo для холста
            canvas.undo();
        }
    }
}, true);

function stepBack() {
    canvas.undo();
}

function stepForward() {
    canvas.redo();
}

// Copy Ctrl + C
document.addEventListener('keydown', function (e) {
    // Проверяем, нажата ли клавиша Ctrl + C
    if (e.ctrlKey === true) {
        if (e.key === 'c' || e.key === 'C') {
            cloneObject();
        }
    }
}, true);

// Paste Ctrl + v
document.addEventListener('keydown', function (e) {

    // Проверяем, нажата ли клавиша Ctrl + V
    if (e.ctrlKey === true) {
        if (e.key === 'v' || e.key === 'V') {
            pasteObjectCtrlV()
        }
    }
}, true);


//contextMenu 
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    canvas.isDrawingMode = false;

    if (e.target.classList.value != 'upper-canvas canvas') {
        return
    }
    elements.context_menu.style.left = e.clientX + 'px';
    elements.context_menu.style.top = e.clientY + 'px';
    elements.context_menu.classList.toggle('visible');
    contextMenuClick = { x: e.clientX, y: e.clientY };


}, true)

// Регистрируем обработчик события keydown на документе
document.addEventListener('keydown', function (e) {
    //Если холст пустй
    if (canvas.getObjects().length <= 0) {
        return
    }
    // Проверяем, нажата ли клавиша Delete или Backspace
    else if (e.key === 'Delete') {
        // Получаем активный объект или группу объектов
        var activeObj = canvas.getActiveObject();
        // Проверяем, есть ли активный объект
        if (activeObj) {
            deleteObject();
            clearRightMenu();
        }
    }
}, true);


// включает режим рисования
function draw() {
    clearAllMenu();
    canvas.discardActiveObject().renderAll();
    elements.stroke_picker.color = currentCollor;
    elements.stroke_width.value = currentDrawWidth;
    canvas.isDrawingMode = !canvas.isDrawingMode;
    if (canvas.isDrawingMode) {
        canvas.off('mouse:down')
        const brush = canvas.freeDrawingBrush;
        brush.color = currentCollor;
        brush.width = currentDrawWidth;

    }
}



//Добавляет текст
function addText() {
    canvas.discardActiveObject().renderAll();
    if (canvas.isDrawingMode) {
        stopDraw();
    }

    canvas.defaultCursor = 'grabbing';
    // Обработчик события клика мыши
    canvas.on('mouse:down', function (event) {
        var pointer = canvas.getPointer(event.e);
        // Создаем новый text
        var text = new fabric.IText('Введите\nтекст', {

            left: pointer.x,
            top: pointer.y,
            fontSize: 16,
            fontSizeMult: 1,
            textAlign: 'left',
            fontStyle: 'italic',
            fontFamily: 'Arial',
            statefullCache: true,
            strokeWidth: 0,
            strokeUniform: true,
        });

        // Добавляем новый text на холст
        canvas.add(text).setActiveObject(text);
        //Меняем курсор на стандартный 
        canvas.defaultCursor = 'default';
        //Отключаем текущий обработчик и возвращаем стандарнтый 
        canvas.off('mouse:down');
        canvas.on('mouse:down', leftClick);
    });

}

//Добавление прямоугольника
function addRect() {
    canvas.discardActiveObject().renderAll();
    if (canvas.isDrawingMode) {
        stopDraw();
    }

    canvas.defaultCursor = 'grabbing';
    // Обработчик события клика мыши
    canvas.on('mouse:down', function (event) {
        var pointer = canvas.getPointer(event.e);
        // Создаем новый прямоугольник
        var newRect = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            fill: '#ffffff',
            width: 100,
            height: 100,
            statefullCache: true,
            stroke: '#000000',
            strokeWidth: 1,
            strokeUniform: true,
        });

        // Добавляем новый прямоугольник на холст
        canvas.add(newRect).setActiveObject(newRect);
        //Меняем курсор на стандартный 
        canvas.defaultCursor = 'default';
        //Отключаем текущий обработчик и возвращаем стандарнтый 
        canvas.off('mouse:down');
        canvas.on('mouse:down', leftClick);
    });
}

//Добавление треугольника
function addTriangle(e) {
    canvas.discardActiveObject().renderAll();
    if (canvas.isDrawingMode) {
        stopDraw();
    }

    canvas.defaultCursor = 'grabbing';
    // Обработчик события клика мыши
    canvas.on('mouse:down', function (event) {
        var pointer = canvas.getPointer(event.e);
        // Создаем новый прямоугольник
        var p1 = { x: pointer.x, y: pointer.y }; // верхняя точка треугольника === координатам мыши
        // смещаем вниз точку на нужную нам высоту и влево на полвину от неё для равнобедренного труегольника
        var p2 = { x: pointer.x - 50, y: pointer.y + 100 };
        // смещаем вниз точку на нужную  нам высоту и вправо на полвину от неё для равнобедренного труегольника
        var p3 = { x: pointer.x + 50, y: pointer.y + 100 };
        var triangle = new fabric.Polygon([p1, p2, p3], {
            fill: '#ffffff',
            statefullCache: true,
            stroke: '#000000',
            strokeWidth: 1,
            strokeUniform: true,
        });

        // Добавляем на холст
        canvas.add(triangle).setActiveObject(triangle);
        //Меняем курсор на стандартный 
        canvas.defaultCursor = 'default';
        //Отключаем текущий обработчик и возвращаем стандарнтый 
        canvas.off('mouse:down');
        canvas.on('mouse:down', leftClick);
    });
}


function addRhombus(e) {
    canvas.discardActiveObject().renderAll();
    if (canvas.isDrawingMode) {
        stopDraw();
    }
    canvas.defaultCursor = 'grabbing';
    // Обработчик события клика мыши
    canvas.on('mouse:down', function (event) {
        var pointer = canvas.getPointer(event.e);
        // Создаем новый ромб
        var p1 = { x: pointer.x, y: pointer.y };
        var p2 = { x: pointer.x - 50, y: pointer.y + 50 };
        var p3 = { x: pointer.x, y: pointer.y + 100 };
        var p4 = { x: pointer.x + 50, y: pointer.y + 50 };
        var rhombus = new fabric.Polygon([p1, p2, p3, p4], {
            fill: '#ffffff',
            statefullCache: true,
            stroke: '#000000',
            strokeWidth: 1,
            strokeUniform: true,
        });
        // Добавляем на холст
        canvas.add(rhombus).setActiveObject(rhombus);
        //Меняем курсор на стандартный 
        canvas.defaultCursor = 'default';
        //Отключаем текущий обработчик и возвращаем стандарнтый 
        canvas.off('mouse:down');
        canvas.on('mouse:down', leftClick);
    });
}

//Добавление круга
function addCircle() {
    canvas.discardActiveObject().renderAll();
    if (canvas.isDrawingMode) {
        stopDraw();
    }

    canvas.defaultCursor = 'grabbing';
    // Обработчик события клика мыши
    canvas.on('mouse:down', function (event) {
        var pointer = canvas.getPointer(event.e);
        // Создаем новый круг
        var circle = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 50,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 1,
            strokeUniform: true,
        });

        // Добавляем новый круг на холст
        canvas.add(circle).setActiveObject(circle);
        //Меняем курсор на стандартный 
        canvas.defaultCursor = 'default';
        //Отключаем текущий обработчик и возвращаем стандарнтый 
        canvas.off('mouse:down');
        canvas.on('mouse:down', leftClick);
    });
}



// рисуем линии
function drawArrow() {

    if (canvas.isDrawingMode) {
        stopDraw()
    }
    canvas.discardActiveObject();

    var line, isDown, arrow;

    canvas.on('mouse:down', function (o) {

        selectionOff();
        isDown = true;
        var pointer = canvas.getPointer(o.e);
        var points = [pointer.x, pointer.y, pointer.x, pointer.y];
        line = new fabric.Line(points, {
            strokeWidth: 5,
            stroke: '#000000',
            originX: 'center',
            originY: 'center',
        });
        arrow = new fabric.Triangle({
            left: pointer.x,
            top: pointer.y,
            fill: '#000000',
            width: 20,
            height: 20,
            angle: 45,
            originX: 'center',
            originY: 'center',
        });
        canvas.add(line);
        canvas.add(arrow);

    });

    canvas.on('mouse:move', function (o) {
        // Отключаем подсвечивание активной области
        canvas.selectionColor = null;
        canvas.selectionBorderColor = null;

        if (!isDown) return;
        var pointer = canvas.getPointer(o.e);
        line.set({ x2: pointer.x, y2: pointer.y });

        var dx = line.x2 - line.x1;
        var dy = line.y2 - line.y1;
        var angle = Math.atan2(dy, dx);

        arrow.set({
            left: line.get('x2'),
            top: line.get('y2'),
            angle: angle * 180 / Math.PI + 90
        });

        canvas.renderAll();
    });

    canvas.on('mouse:up', function (o) {
        isDown = false;
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
        canvas.selectionColor = 'rgba(100, 100, 255, 0.3)';
        canvas.selectionBorderColor = 'rgba(255, 255, 255, 0.3)';
        setTimeout(groupObject, 1);
    });

}


function selectionOff() {
    canvas.forEachObject(function (object) {
        object.set('selectable', false);
    });
}


function selectionOn() {
    canvas.forEachObject(function (object) {
        object.set('selectable', true);
    });
}



//Фунция отслеживания клика
function leftClick(event) {

    
    const activeObj = canvas.getActiveObject();
    elements.text_menu.classList.remove('active');
    shapeMenu.classList.remove('active_shape');
    getTargetParam();

    var evt = event.e;

    if (evt.altKey === true) {
        
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
        return
    }

    else if (event.target) {

        addItemRightMenu();
        elements.properties_active_object.style.display = 'flex'

        if (event.target && event.target.type === 'image') {
            activeObj.bringToFront();
            //При клике на текст
        } else if (activeObj && activeObj.type === 'i-text') {
            showTextMenu();
            addItemRightMenu();
            activeObj.bringToFront();
        } else if (activeObj && activeObj.type === 'rect'
            || event.target.type === 'circle'
            || event.target.type === 'triangle'
            || event.target.type === 'circle'
            || event.target.type === 'polygon'
        ) {
            showShapeMenu();
            addItemRightMenu();
            activeObj.bringToFront();
        } else if (event.target) {
            addItemRightMenu();
            activeObj.bringToFront();
        }

    } else if (activeObj === null) {
        elements.properties_active_object.style.display = 'none'
        return
    }
    canvas.renderAll()
}

// оключает режим рисования 
function stopDraw() {
    canvas.on('mouse:down', leftClick);
    canvas.isDrawingMode = false;
}


canvas.on('mouse:move', function (opt) {
    if (this.isDragging) {
        var e = opt.e;
        var vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;

        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
    }
});

canvas.on('mouse:up', function (opt) {
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
    this.selection = true;
});



canvas.on('mouse:wheel', function (opt) {

    var activeObj = canvas.getActiveObject();

    if (activeObj && activeObj.type === 'i-text') {
        clearTextMenu();
    }


    if (opt.e.altKey === true) {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
        elements.zoom_value.innerText = parseFloat(canvas.getZoom().toFixed(1) * 100) + '%';
        createSvgBackground();
        if (zoom > 0 && zoom < 1.5) {
            canvas.getElement().style.backgroundSize = '100%';
        }
        else if (zoom > 1.5 && zoom < 2) {
            canvas.getElement().style.backgroundSize = '150%';
        }
        else if (zoom > 2 && zoom < 3) {
            canvas.getElement().style.backgroundSize = '200%';
        } else if (zoom > 3 && zoom < 4) {
            canvas.getElement().style.backgroundSize = '250%';
        } else if (zoom > 4 && zoom < 5) {
            canvas.getElement().style.backgroundSize = '300%';
        } else if (zoom > 5 && zoom < 6) {
            canvas.getElement().style.backgroundSize = '350%';
        } else if (zoom > 6 && zoom < 7) {
            canvas.getElement().style.backgroundSize = '400%';
        } else if (zoom > 7 && zoom < 8) {
            canvas.getElement().style.backgroundSize = '450%';
        } else if (zoom > 8 && zoom < 9) {
            console.log(canvas.getElement().style);
            canvas.getElement().style.backgroundSize = '500%';
        } else if (zoom > 9 && zoom < 10) {
            canvas.getElement().style.backgroundSize = '550%';
        } else if (zoom > 11 && zoom < 12) {
            canvas.getElement().style.backgroundSize = '600%';
        } else if (zoom > 12 && zoom < 13) {
            canvas.getElement().style.backgroundSize = '650%';
        } else if (zoom > 13 && zoom < 14) {
            canvas.getElement().style.backgroundSize = '700%';
        } else if (zoom > 14 && zoom < 15) {
            canvas.getElement().style.backgroundSize = '750%';
        } else if (zoom > 15 && zoom < 16) {
            canvas.getElement().style.backgroundSize = '800%';
        } else if (zoom > 16 && zoom < 17) {
            canvas.getElement().style.backgroundSize = '1000%';
        }

        showShapeMenu();

    } else if (opt.e.deltaY > 0 && canvas.getHeight() < 5000) {
        clearAllMenu();
        canvas.setHeight(canvas.getHeight() + 100);
        createSvgBackground(canvas);

    } else {
        return
    }
});


function cloneObject() {
    if (canvas.getActiveObject()) {
        canvas.getActiveObject().clone(function (cloned) {
            _clipboard = cloned;
        })
    }
}

// Вставляем объект через контекстное меню координат контекстного меню
function pasteObject(e) {

    const point = canvas.getPointer(e);

    // clone again, so you can do multiple copies.
    _clipboard.clone(function (clonedObj) {
        canvas.discardActiveObject();

        clonedObj.set({
            left: point.x,
            top: point.y,
            evented: true,
        });
        if (clonedObj.type === 'activeSelection') {
            // active selection needs a reference to the canvas.
            clonedObj.canvas = canvas;
            clonedObj.forEachObject(function (obj) {
                canvas.add(obj);
            });
            // this should solve the unselectability
            clonedObj.setCoords();
        } else {
            canvas.add(clonedObj);
        }

        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
    });
}

// Вставляем объект через ctrl + V
function pasteObjectCtrlV() {

    if (_clipboard != undefined) {
        _clipboard.left = _clipboard.left + 20;
        _clipboard.top = _clipboard.top - 10;
        // десериализовать объект из JSON-формата и добавить на холст
        fabric.util.enlivenObjects([_clipboard], function (objects) {
            objects.forEach(function (o) {
                canvas.add(o);
            });
        });
    } else return
}



//Удаляет выделенные объекты
function deleteObject() {

    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach(function (object) {
        clearAllMenu();
        canvas.remove(object);
    });
    canvas.discardActiveObject().renderAll();
    clearRightMenu()
}

//Очишает канвас
function clearCanvas() {

    stopDraw();
    canvas.clear();
    createSvgBackground(canvas);
    resizeCanvas();
    clearAllMenu();
    canvas.renderAll();

}

//Группировка активных обьектов
function groupObject() {
    if (!canvas.getActiveObject()) {
        return;
    }
    if (canvas.getActiveObject().type !== 'activeSelection') {
        return;
    }

    canvas.getActiveObject().toGroup();
    selectionOn();
    canvas.renderAll();
}




// Разгруппировка активных обьектов
function ungroupObject() {
    if (!canvas.getActiveObject()) {
        return;
    }
    if (canvas.getActiveObject().type !== 'group') {
        return;
    }
    canvas.getActiveObject().toActiveSelection();
    canvas.requestRenderAll();
    canvas.discardActiveObject();
}


//Сахраняем картинку из канвас
function saveCanvas() {
    const dataURL = canvas.toDataURL({
        format: 'png',
        multiplier: 2,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "my-image-name.jpg";
    link.click();
    canvas.renderAll();
}

function saveObject() {
    var obj = canvas.getActiveObject();
    var svg = obj.toSVG();
    var blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-svg.svg";
    link.click();
    canvas.renderAll();
}

//Вставка изображений drag and drop
canvas.on('drop', function (event) {
    event.e.stopPropagation();
    event.e.stopImmediatePropagation();
    event.e.preventDefault();


    if (event.e.dataTransfer.files.length > 0) {
        var files = event.e.dataTransfer.files;
        for (var i = 0, f; f = files[i]; i++) {
            // Only process image files.
            if (f.type.match('image.*')) {
                // Read the File objects in this FileList.
                var reader = new FileReader();
                // Use an IIFE to capture the current file
                (function (file) {
                    // listener for the onload event
                    reader.onload = function (evt) {
                        // put image on canvas
                        var dataUrl = evt.target.result;
                        if (file.type === "image/svg+xml") {
                            fabric.loadSVGFromURL(dataUrl, function (objects, options) {
                                var svg = fabric.util.groupSVGElements(objects, options);
                                canvas.add(svg);
                            });
                        } else {
                            fabric.Image.fromURL(dataUrl, function (obj) {
                                canvas.add(obj);
                            });
                        }
                    };
                    reader.readAsDataURL(file);
                })(f);
            }
        }
    }
});

//После удаления элементов проверяем остался ли див в меню активностей;
function clearRightMenu() {

    if (canvas.getObjects().length <= 0) {
        elements.properties_active_object.style.display = 'none'
        elements.canvas_option.style.display = 'none'
        return
    }
    return
}


function addItemRightMenu() {

    elements.target_param.replaceChildren();
    // Создаем новый элемент div
    const saveDiv = document.createElement("div");

    saveDiv.style.opacity = 0;

    // Задаем ему текстовое содержимое
    saveDiv.innerText = "save SVG";
    // Добавляем ему стиль transition с продолжительностью 0.3 секунды
    // Добавляем новый элемент к родительскому элементу body
    elements.target_param.appendChild(saveDiv);
    // Изменяем цвет фона и шрифта нового элемента через 100 мсек
    setTimeout(function () {


        saveDiv.classList.add('save_div');
        saveDiv.style.opacity = 1;
        saveDiv.addEventListener('click', saveObject)
    }, 100);

}


//Изменение заливки
function changeFill(evt) {
    const color = evt.detail.hex8;
    const activeObj = canvas.getActiveObjects();

    activeObj.forEach((obj) => {
        obj.fill = color;
        canvas.renderAll();
    })

    //Получаем текущее значение opacity
    const str = evt.detail.hsva;
    const values = str.split(',');
    const opacity = values[values.length - 1].slice(0, -1); // Удаляем последнюю скобку
    elements.fill_value.innerText = parseInt(opacity * 100) + '%';

}


function changeColorText(evt) {
    const color = evt.detail.hex8;
    const activeObj = canvas.getActiveObjects();
    activeObj.forEach((obj) => {
        obj.fill = color;
        canvas.renderAll();
    })
}

//Изменение цвета обводки
function changeStroke(evt) {
    const color = evt.detail.hex8;
    const activeObj = canvas.getActiveObjects();
    if (canvas.isDrawingMode) {
        stopDraw();
        currentCollor = color;
        draw();
        return
    } else {
        activeObj.forEach((obj) => {
            if (obj.hasOwnProperty('stroke') && obj.stroke != null) {
                obj.stroke = color;
                canvas.renderAll();
            }
            else return
        })
    }
}


function plusStrokeWidth() {
    const colorStroke = elements.stroke_picker.color.toHex8();
    const activeObj = canvas.getActiveObject();
    const currentStrokeValue = parseFloat(elements.stroke_width.value);
    if (currentStrokeValue + 1 >= 100) {
        return
    }
    else if (canvas.isDrawingMode) {
        stopDraw();
        currentDrawWidth = currentStrokeValue + 1
        draw();
        return currentDrawWidth;
    }
    else if (activeObj && activeObj.type === 'path') {
        elements.stroke_width.value = parseFloat(elements.stroke_width.value) + 1;
        currentDrawWidth = currentStrokeValue + 1;
        activeObj.strokeWidth = currentStrokeValue;
        canvas.renderAll();
        return
    }
    else if (activeObj && activeObj.hasOwnProperty('stroke')) {
        elements.stroke_width.value = parseFloat(elements.stroke_width.value) + 1;
        activeObj.stroke = '#' + colorStroke;
        activeObj.strokeWidth = currentStrokeValue + 1;
        canvas.renderAll();
        return currentDrawWidth;
    } else {
        console.log("false");
    }
}

function minusStrokeWidth() {
    const colorStroke = elements.stroke_picker.color.toHex8();
    const activeObj = canvas.getActiveObject();
    const currentStrokeValue = parseFloat(elements.stroke_width.value);


    if (currentStrokeValue - 1 < 0) {
        return
    } else if (canvas.isDrawingMode) {
        stopDraw();
        currentDrawWidth = currentStrokeValue - 1
        draw();
        return currentDrawWidth;
    } else if (activeObj && activeObj.type === 'path') {
        elements.stroke_width.value = parseFloat(elements.stroke_width.value) - 1;
        currentDrawWidth = currentStrokeValue - 1;
        activeObj.strokeWidth = currentStrokeValue;
        canvas.renderAll();
        return
    } else if (activeObj && activeObj.hasOwnProperty('stroke')) {
        elements.stroke_width.value = parseFloat(elements.stroke_width.value) - 1;
        activeObj.stroke = '#' + colorStroke;
        activeObj.strokeWidth = currentStrokeValue - 1;
        canvas.renderAll();
    } else {
        return;
    }
}

//Ввод размеров обводки через инпут
function inputStrokeWidth(e) {

    const colorStroke = elements.stroke_picker.color.toHex8();
    const activeObj = canvas.getActiveObject();
    const inputStrokeValue = elements.stroke_width.value ? parseFloat(elements.stroke_width.value) : 0;

    if (canvas.isDrawingMode) {
        stopDraw();
        if (inputStrokeValue < 0) {
            elements.stroke_width.value = parseFloat(0);
            currentDrawWidth = 0;
            draw();
            return
        } else if (inputStrokeValue > 100) {
            stopDraw();
            elements.stroke_width.value = parseInt(100);
            currentDrawWidth = 100;
            draw();
            return
        } else {
            stopDraw();
            currentDrawWidth = parseFloat(inputStrokeValue);
            draw();
        }

        return
    }
    else if (inputStrokeValue <= 0) {
        if (activeObj) {
            elements.stroke_width.value = parseFloat(0);
            activeObj.stroke = '#' + colorStroke;
            activeObj.strokeWidth = inputStrokeValue;
            canvas.renderAll();
            return
        } else {
            elements.stroke_width.value = parseFloat(0);
            return
        }

    }
    else if (inputStrokeValue > 100) {
        if (activeObj) {
            elements.stroke_width.value = parseFloat(100);
            activeObj.stroke = '#' + colorStroke;
            activeObj.strokeWidth = 100;
            canvas.renderAll();
            return
        } else {
            elements.stroke_width.value = parseFloat(100);
            return
        }
    }

    else {
        if (activeObj && inputStrokeValue != NaN) {
            elements.stroke_width.value = parseFloat(inputStrokeValue);
            activeObj.stroke = '#' + colorStroke;
            activeObj.strokeWidth = inputStrokeValue;
            canvas.renderAll();
            return
        }
        else {
            return
        }
    }

}

//Модификация обьекта (передвижение по канвас, scaling)
canvas.on('object:modified', function (e) {
    var modifiedObject = e.target;


    if (modifiedObject.type === 'activeSelection') {
        return
    }

    else if (modifiedObject.type === 'circle') {
        var width = modifiedObject.width * modifiedObject.scaleX;
        var height = modifiedObject.height * modifiedObject.scaleY;
        widthValue.innerText = parseInt(height);
        heightValue.innerText = parseInt(width);
        return
    } else if (modifiedObject.type === 'i-text') {
        var fontSize = modifiedObject.fontSize * modifiedObject.scaleX;
        modifiedObject.set({
            fontSize: fontSize,
            scaleX: 1,
            scaleY: 1
        });


    } else if (modifiedObject.type === 'path') {
        return
    } else if (modifiedObject.type === 'image') {
        return
    } else if (modifiedObject.type === 'rect') {

        var width = modifiedObject.width * modifiedObject.scaleX;
        var height = modifiedObject.height * modifiedObject.scaleY;
        widthValue.innerText = parseInt(height);
        heightValue.innerText = parseInt(width);

        modifiedObject.set({
            width: width,
            height: height,
            scaleX: 1,
            scaleY: 1
        });
    }


    canvas.renderAll();
});


function showTextMenu() {
    // Получаем активный объект
    var object = canvas.getActiveObject();
    // Получаем ограничивающий прямоугольник объекта
    var boundingRect = object.getBoundingRect();

    var fontSize = object.fontSize * object.scaleX;
    // Получаем координаты холста относительно окна
    var canvasRect = canvas.getElement().getBoundingClientRect();

    // Вычисляем координаты объекта относительно окна
    var objectLeft = boundingRect.left + canvasRect.left;
    var objectTop = boundingRect.top + canvasRect.top;

    elements.font_size_value.innerText = parseInt(fontSize);
    elements.text_menu.style.left = objectLeft - 20 + 'px';
    elements.text_menu.style.top = objectTop - 90 + 'px';
    elements.text_menu.classList.add('active');
}


function showShapeMenu(e) {


    // Получаем активный объект
    var object = canvas.getActiveObject();

    if (object) {
        // Получаем ограничивающий прямоугольник объекта
        var boundingRect = object.getBoundingRect();

        var fontSize = object.fontSize * object.scaleX;
        // Получаем координаты холста относительно окна
        var canvasRect = canvas.getElement().getBoundingClientRect();

        // Вычисляем координаты объекта относительно окна
        var objectLeft = boundingRect.left + canvasRect.left;
        var objectTop = boundingRect.top + canvasRect.top;

        shapeMenu.style.left = objectLeft - 40 + 'px';
        shapeMenu.style.top = objectTop - 90 + 'px';

        shapeMenu.classList.add('active_shape');
    }
}

function clearTextMenu() {
    if (elements.text_menu.classList.contains('active')) {
        elements.text_menu.classList.remove('active');
    }

}

function clearShapeMenu() {
    if (shapeMenu.classList.contains('active_shape')) {
        shapeMenu.classList.remove('active_shape');
    }

}


function clearAllMenu() {
    clearRightMenu();
    clearTextMenu();
    clearShapeMenu();
}

//scaling объектов  (тянем за corner)
canvas.on('object:scaling', function (e) {
    const activeObj = e.target;

});


// Отслеживаем передвижение по канвасу объектов
canvas.on('object:moving', function (e) {
    const activeObj = e.target;
    // Получаем ограничивающий прямоугольник объекта
    const boundingRect = activeObj.getBoundingRect();
    // Получаем координаты холста относительно окна
    const canvasRect = canvas.getElement().getBoundingClientRect();

    // Вычисляем координаты объекта относительно окна
    const objectLeft = boundingRect.left + canvasRect.left;
    const objectTop = boundingRect.top + canvasRect.top;

    elements.position_x_value.innerText = parseInt(objectLeft)
    elements.position_y_value.innerText = parseInt(objectTop);


    if (activeObj.type === 'i-text') {
        showTextMenu();
    } else if (activeObj.type === 'rect' || activeObj.type === 'circle'
        || activeObj.type === 'triangle' || activeObj.type === 'circle'
        || activeObj.type === 'polygon') {
        showShapeMenu();
    }

})

// Отслекживаем добавление элементов на канвас
canvas.on('object:added', function (e) {
    elements.canvas_option.style.display = 'flex';

});

// Отслеживаем удаление элементов с канваса
canvas.on('object:removed', function (e) {
    if (canvas.getObjects().length === 0) {
        elements.position_x_value.innerText = '';
        elements.position_y_value.innerText = '';
        clearRightMenu();
        elements.properties_active_object.style.display = 'none'
        elements.canvas_option.style.display = 'none'
    }
});


function fontPlus() {
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
        if (activeObj.type === "i-text") {
            elements.font_size_value.innerText = parseInt(activeObj.fontSize) + 1;
            activeObj.set({ fontSize: elements.font_size_value.innerText = parseInt(activeObj.fontSize) + 1 });
            canvas.renderAll();
        } else if (activeObj.type === "group" || activeObj.type === "activeSelection") {
            const objects = activeObj.getObjects();
            for (let i = 0; i < objects.length; i++) {
                if ('fontSize' in objects[i]) {
                    elements.font_size_value.innerText = parseInt(objects[i].fontSize) + 1;
                    objects[i].set({ fontSize: elements.font_size_value.innerText = parseInt(objects[i].fontSize) + 1 });
                }
            }
            canvas.renderAll();
        }
    }
}

function fontMinus() {
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
        if (activeObj.type === "i-text") {
            elements.font_size_value.innerText = parseInt(activeObj.fontSize) - 1;
            activeObj.set({ fontSize: elements.font_size_value.innerText = parseInt(activeObj.fontSize) - 1 });
            canvas.renderAll();
        } else if (activeObj.type === "group" || activeObj.type === "activeSelection") {
            const objects = activeObj.getObjects();
            for (let i = 0; i < objects.length; i++) {
                if ('fontSize' in objects[i]) {
                    elements.font_size_value.innerText = parseInt(objects[i].fontSize) - 1;
                    objects[i].set({ fontSize: elements.font_size_value.innerText = parseInt(objects[i].fontSize) - 1 });
                }
            }
            canvas.renderAll();
        }
    }
}



//Отправка данных в правое меню координаты , ширина , высота
function getTargetParam() {
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
        if (activeObj.type === "circle" || activeObj.type === "rect") {
            const width = parseInt(activeObj.getScaledWidth());
            const height = parseInt(activeObj.getScaledHeight());
            const color = activeObj.fill;
            elements.fill_picker.color = color;

            // Получаем ограничивающий прямоугольник объекта
            const boundingRect = activeObj.getBoundingRect();
            // Получаем координаты холста относительно окна
            const canvasRect = canvas.getElement().getBoundingClientRect();

            // Вычисляем координаты объекта относительно окна
            const objectLeft = boundingRect.left + canvasRect.left;
            const objectTop = boundingRect.top + canvasRect.top;

            elements.stroke_width.value = activeObj.strokeWidth;
            elements.position_x_value.innerText = parseInt(objectLeft)
            elements.position_y_value.innerText = parseInt(objectTop);


        } else if (activeObj.type === "path") {

            elements.stroke_width.value = activeObj.strokeWidth;

        } else if (activeObj.type === "i-text") {

            elements.font_size_value.innerText = parseInt(activeObj.fontSize);
            elements.font_size_value.style.opacity = 1;
        }
    }
}


