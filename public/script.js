const canvas = $("#canvas");
//console.log(mycanvas)
const context = canvas[0].getContext("2d");


canvas.on("mousedown", e =>
{
    console.log("mousedown")
    this.down = true;
    let x = e.offsetX;
    let y = e.offsetY;
    console.log(x, y)
    context.moveTo(x, y);
    context.lineWidth = 2;
    context.strokeStyle = "black"


})

canvas.on("mousemove", e =>
{
    if (this.down) {
        let x = e.offsetX;
        let y = e.offsetY;
        console.log("mousemove")
        context.lineTo(x, y);
        context.stroke();

    }


})

$(document).on("mouseup", e =>
{
    this.down = false;
    const sendData = $("input[name='sig']").val(canvas[0].toDataURL());

    console.log("sign", sendData)
})


