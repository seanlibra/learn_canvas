const canvas = document.getElementById('mycanvas')
const ctx = canvas.getContext("2d")

const ww = canvas.width = 800
const wh = canvas.height = 800

const Ball = function() { //初始化Ball的函數建構子
    this.p = {
        x:ww / 2,
        y:wh / 2
    },
    this.v = {
        x:3,
        y:3
    }
    this.a = {
        x:0,
        y:1
    },
    this.r = 50
    this.dragging = false
}

const controls = {  //初始化gui的控制項
    vx:0,
    vy:0,
    ay:0.6,
    update:true,
    fade:0.99,
    color:"#fff",
    step:function() {
        Ball_1.update()
    },
    FPS:30
}

const gui = new dat.GUI()
gui.add(controls,'vx',-50,50).listen().onChange( value => {
    Ball_1.v.x = value  //onChange預設會傳回一個值，這個值就是用來改變物體的運動值
})

gui.add(controls,'vy',-50,50).listen().onChange( value => {
    Ball_1.v.y = value  
})

gui.add(controls,'ay',-1,1).step(0.001).listen().onChange( value => {
    Ball_1.a.y = value  //step代表每格的精細度
})

gui.add(controls,'fade',0,1).step(0.01).listen()

gui.add(controls,'update')

gui.addColor(controls,'color')

gui.add(controls,'step')

gui.add(controls,'FPS',0,120)

Ball.prototype.draw = function() { //在Ball的原型上註冊draw事件
    ctx.beginPath()
    ctx.save()
        ctx.translate(this.p.x,this.p.y)
        ctx.arc(0,0,this.r,0,Math.PI*2)
        ctx.fillStyle=controls.color
        ctx.fill()
    ctx.restore()
    this.drawV()
}

Ball.prototype.update = function() {
    if (this.dragging === false) {
        this.p.x += this.v.x  //球的位置等於每秒V的疊加
        this.p.y += this.v.y
    
        this.v.x += this.a.x //如同課堂上所說 速度等於目前速度+每秒的變化量(加速度)a
        this.v.y += this.a.y
    
        this.v.x*=controls.fade //速度還需要乘上阻力，這邊的阻力就直接綁定controls的控制項，就不用雙向綁定
        this.v.y*=controls.fade
        
        controls.vx = this.v.x //這個部分是為了在物體把在物體反彈後當速度變成負值時需要把現在的vx寫回去控制項，有點類似雙向綁定的概念，有了此項，可以看到當物體擁有v=3的速度撞擊右側牆壁後gui會馬上反應成v=-3 (碰到牆壁速度呈反向)
        controls.vy = this.v.y
        controls.ay = this.a.y
    }
}

Ball.prototype.checkBoundary = function() {
    if ( this.p.x+this.r>ww) {  // 翻譯蒟蒻:現在的座標x加上球的半徑如果大於整個畫布寬度則
        this.v.x = -Math.abs(this.v.x) //這邊是右方牆壁
    }
    if (this.p.y + this.r > wh ) { // 翻譯蒟蒻:現在的座標y加上球的半徑如果大於整個畫布高度則  *再次提醒:畫布的座標是由左上角開始，這邊我一開始一直搞錯以為往下是負值，正確來說 往下跟往右都是正值
        this.v.y = -Math.abs(this.v.y)  // 這邊是下方牆壁
    }
    if (this.p.x - this.r < 0 ) { // 
        this.v.x = Math.abs(this.v.x)  // 這邊是左方牆壁
    }
    if (this.p.y - this.r < 0 ) { // 
        this.v.y = Math.abs(this.v.y)  // 這邊是上方牆壁
    }
}

Ball.prototype.drawV = function() {
    ctx.save() 
      ctx.beginPath()
      ctx.translate(this.p.x,this.p.y)
      ctx.scale(3,3)
      ctx.moveTo(0,0)
      ctx.lineTo(this.v.x,this.v.y) //代表除了x軸和y軸外第三條線的速度
      ctx.strokeStyle="blue"
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(this.v.x,0)
      ctx.strokeStyle="red"
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(0,this.v.y)
      ctx.strokeStyle="green"
      ctx.stroke()


    ctx.restore()
}

let Ball_1 

function init () {
    Ball_1 = new Ball //建立Ball的實體
}
init()

function update() {
  if (controls.update) {
    Ball_1.update() //先註冊Ball_1的執行，之後再使用setInterval固定在一秒內執行30次外部的update FPS = 30
  }
  Ball_1.checkBoundary()
}

setInterval(update,1000/30)

function draw() {
    ctx.fillStyle="rgba(0,0,0,.5)"
    ctx.fillRect(0,0,ww,wh)

    Ball_1.draw()
    setTimeout(draw,1000/controls.FPS)
}

draw()

let mousePos = { x:0 , y:0 } // 註冊mouse物件並給予初始值

function getDistance(p1,p2) {  //這個函數是用來判斷滑鼠指定的位置是否有在球的半徑裡面以此來觸發拖曳功能
    let temp1 = p1.x - p2.x   //這邊是三角形的長度計算，試著假設有兩點為{x:0,y:3}及 {x:4,:y:0}   為了得出其中兩邊較短的距離所以用相減的方式
    let temp2 = p1.y - p2.y
    let dist = Math.pow(temp1,2) + Math.pow(temp2,2) //畢氏定理 斜邊長 = 兩股的平方開根號 Math.pow代表平方
    return Math.sqrt(dist) //Math.sqrt代表開根號
}

// console.log(getDistance({x:0,y:3},{x:4,y:0}))


canvas.addEventListener("mousedown",function(e){
      mousePos = { x:e.x - (e.pageX - e.offsetX),y:e.y - (e.pageY - e.offsetY) } //這邊的座標依然是以左上為中心點，但這邊跟課程不一樣的地方是，我的表演畫面沒有滿版而是在置中呈現，所以必須先口調canvas畫布上方以及左邊的距離
    //   console.log(mousePos)
    //   console.log(e)
      let dist = getDistance(mousePos,Ball_1.p)  //利用此函數計算出滑鼠位置到滑鼠中心的距離
      if ( dist < Ball_1.r) //當距離小於半徑代表捕捉到此球體
        {
            Ball_1.dragging = true;
        } 
    })

canvas.addEventListener("mouseup",function(e){
    Ball_1.dragging = false;
    canvas.style.cursor = "initial"
})

canvas.addEventListener("mousemove",function(e){
    let nowPos = { x:e.x - (e.pageX - e.offsetX),y:e.y - (e.pageY - e.offsetY) }
    // console.log(nowPos)
    if (Ball_1.dragging) {
        let dx = nowPos.x - mousePos.x  // mousePos代表按下去之後取得的位置  now - mousepos這個距離差就是移動的距離
        let dy = nowPos.y - mousePos.y  // dx dy為兩點移動的變化量
        // console.log(dx,dy)
        Ball_1.p.x += dx
        Ball_1.p.y += dy
        mousePos = nowPos

        Ball_1.v.x = dx //最後的速度再加上最後變化量就能做到拋飛的動作
        Ball_1.v.y = dy
    } 
    let dist  = getDistance(nowPos,Ball_1.p)
    if (dist < Ball_1.r) {
        canvas.style.cursor = "move"
    } else {
        canvas.style.cursor = "initial"
    }
    // if(Ball_1.dragging) {
    //     canvas.style.cursor = "move"
    // } else {
    //     canvas.style.cursor = "initial"
    // }
})