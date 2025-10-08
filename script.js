const canva = document.getElementById("frame");
const brush_layer = document.getElementById("brush");

const frame = canva.getContext("2d", { willReadFrequently: true });
const brush_frame = brush_layer.getContext("2d");

const seila = 2;
const size = {width:canva.clientWidth*seila, height:canva.clientHeight*seila};

let brush = {
    type:"draw", 
    size: Number(document.getElementById("size").value), 
    pressed:false,
    color: document.getElementById("color").value
};

let lastAxis = null;

let saves = [];
let saves_2 = []; //nome merda trocar depois

canva.width = size.width;
canva.height = size.height;

brush_layer.width = size.width;
brush_layer.height = size.height;


function getAxis(event){ //Retorna um objeto com as coordenadas 
    const bounding = canva.getBoundingClientRect();
    const x = (event.clientX - bounding.x)*seila;
    const y = (event.clientY - bounding.y)*seila; 
    return {x:Math.round(x),y:Math.round(y)};
}

function DrawCursor(axis){
    brush_frame.beginPath();
    brush_frame.arc(axis.x,axis.y, brush.size/2, 0, 2 * Math.PI);
    brush_frame.lineWidth = 5;
    brush_frame.strokeStyle = brush.color;
    brush_frame.stroke();
}

function DrawCoordinate(axis){
    const text =  `X: ${axis.x} | Y: ${axis.y}`;
    brush_frame.font = "40px Arial";
    brush_frame.fillText(text,size.width - 350,size.height - 60);
}

function DrawBrushLayer(axis){
    brush_frame.clearRect(0,0,size.width,size.height);
    DrawCursor(axis, 10, true);
    DrawCoordinate(axis);
}

function Draw(axis) {
    frame.lineWidth = brush.size;
    frame.strokeStyle = brush.color;
    frame.lineCap = "round";
    frame.lineJoin = "round";

    if (!lastAxis) {
        lastAxis = axis;
        frame.beginPath();
        frame.moveTo(axis.x, axis.y);
        return;
    }

    frame.quadraticCurveTo(
         lastAxis.x, lastAxis.y, 
        (lastAxis.x + axis.x) / 2, 
        (lastAxis.y + axis.y) / 2);
    frame.stroke();
    lastAxis = axis;
}

function Erase(axis){
    frame.save();
    frame.globalCompositeOperation = 'destination-out';
    Draw(axis);
    frame.restore();
}

function Clear(){
    frame.clearRect(0,0,size.width,size.height);
}

window.addEventListener("mouseup", () => {
    if (!brush.pressed)return;
    saves.push(frame.getImageData(0,0,size.width,size.height));
    brush.pressed = false;
    lastAxis = null;
});

brush_layer.addEventListener("mouseout", (event) => {brush_frame.clearRect(0,0,size.width,size.height);});

brush_layer.addEventListener("mouseup", (event) => {
    brush.pressed = false;
    lastAxis = null;
    if(brush.type != "draw") return;
    const axis = getAxis(event);
    frame.save();
    frame.beginPath();
    frame.arc(axis.x, axis.y, brush.size / 2, 0, 2 * Math.PI);
    frame.fillStyle = brush.color;
    frame.fill();
    frame.restore();
    saves.push(frame.getImageData(0,0,size.width,size.height));
    saves_2 = [];
});

brush_layer.addEventListener("mousedown", (event) => {
    brush.pressed = true;
    if(brush.type != "draw") return;
    const axis = getAxis(event);
    Draw(axis);
});

brush_layer.addEventListener("mousemove", (event) => {
    const axis = getAxis(event);
    DrawBrushLayer(axis);
    if (!brush.pressed) return;
    switch (brush.type) {
        case "draw":
            Draw(axis);
            break;
        case "erase":
            Erase(axis);
    }  
});

window.addEventListener("resize", () => {
    const state = frame.getImageData(0,0,size.width,size.height);
    size.width = canva.clientWidth*2;
    size.height = canva.clientHeight*2;
    canva.width = size.width;
    canva.height = size.height;
    brush_layer.width = size.width;
    brush_layer.height = size.height;
    frame.putImageData(state, 0, 0);
});


//butões e afins
document.getElementById("draw").addEventListener("click", () => {brush.type = "draw"});
document.getElementById("erase").addEventListener("click", () => {brush.type = "erase"});
document.getElementById("size").addEventListener("change", () => {brush.size = Number(document.getElementById("size").value)})
document.getElementById("color").addEventListener("change", () => {brush.color = document.getElementById("color").value})
document.getElementById("background_color").addEventListener("change", () => {
    const background_layer = document.getElementById("background");
    const background_frame = background_layer.getContext("2d");
    background_frame.clearRect(0, 0, size.width, size.height); 
    background_frame.fillStyle = document.getElementById("background_color").value; 
    background_frame.fillRect(0, 0, size.width, size.height);
});
document.getElementById("undo").addEventListener("click", () => {
    if(saves.length < 1) return;
    if(saves.length == 1){
        Clear();
        saves_2.push(saves.pop());
        return;
    }
    saves_2.push(saves.pop());
    frame.putImageData(saves[saves.length-1],0,0);
})
document.getElementById("reundo").addEventListener("click", () => {
    if(saves_2.length < 1) return;
    saves.push(saves_2.pop());
    frame.putImageData(saves[saves.length-1],0,0);
});
document.getElementById("clear").addEventListener("click", () => {
    Clear();
    saves = [];
    saves_2 = [];
})






