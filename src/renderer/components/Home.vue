<template>
   <div class="wrapper"
   @dragover="dragOnOver"
   @dragenter="dragOnEnter"
   @drop="dropCancel">
    <main class="main">
      <!-- HEader add TASK -->
      <div class="task">
        <input 
          type="text" 
          class="task--attr" 
          v-model="message"
          placeholder="аргументы...">
        <button class="myButton myButton__add" @click="add">добавить</button>
      </div>
      <!-- INFO PATH FILE -->
     
      <!-- SECTION INFO LIST OF TASKS -->
      <div class="tasks-info">
        <div 
          ref="drop"
          class="drop" 
          @drop="dropOn($event)">
              <p class="drop--text" v-if="this.filePath == undefined">перетащите исполняемый файл</p>
              <div class="pathFile" v-else>{{this.filePath}}</div>
        </div>
          <transition-group name="fade" tag="ul" class="list">
            <li class="list--item" v-for="(item, index) in this.tasks" :key="item.id">
              {{index +=1}}: {{ item.path.split("\\").slice(-1).toString() }}
            </li>
          </transition-group>
      </div>
      <!-- RUNN TASK SECTION -->
      <div class="runnTaskSection">
        <transition name="btn">
          <button 
            class="myButton myButton__run" 
            v-if="tasks.length > 0"
            @click="runn">
              запустить
          </button>
        </transition>
      </div>
    </main>
  </div>
</template>

<script>
const { ipcRenderer, dialog } = window.require('electron');
const { spawn } = require('child_process');
const _path = require("path");
const fs = require("fs");
const DB_FILE = "db.json";

import getPath from '../../utils/getPath.js';

  export default {
    name: 'Home',
    data() {
     return {
        message: '',
        tasks: [],
        filePath: undefined,
        dirPath: ''
     }
    },
  
    methods: {
      dbWrite() {
        fs.writeFile(DB_FILE, JSON.stringify(this.tasks),'utf8', (err) => {
            if (err) throw err;
        })
      },
      dbRead() {
        fs.readFile(DB_FILE, 'utf8',(err, data) => {
          if (err) throw err;
          this.tasks = JSON.parse(data)
        });
      },
      // Добавление задачи в список
      add() {
        const path = this.filePath;
        const args = this.message;
        let id = (path + 3) + Math.random();
        if(this.filePath) {
            this.tasks.push({path, args, id});
            // Добавление в ТипоБазуДанных
            this.dbWrite()
            //Чтение из ТипоБазыДанных
            this.dbRead()
        }
        this.filePath = undefined;
        this.message = "";
        this.$refs.drop.style.opacity = '';
      },
      // Запуск задач
      runn () {
          this.startRunn(this.tasks)
      },
      startRunn(el) {
        el.forEach(element => {
           if(element.args != '') {
             spawn(element.path, [element.args], {
              cwd: this.dirPath
            });
           } else {
             spawn(element.path, [], {
              cwd: this.dirPath
            });
           }
        });
      },
      // DRAG AND DROP
      dragOnOver(e) {
        e.preventDefault();
      },
      // Обработка перетаскивания
      dropOn(ev) {
        ev.preventDefault()
        const file = ev.dataTransfer.files[0].path;
        const exe = file.endsWith("exe");
        const lnk = file.endsWith("lnk");
        
         if(exe) {
           this.filePath = file;
         }else if(lnk) {
             this.filePath = "ПУТЬ ОБРАБАТЫВАЕТСЯ ..."
          // ф-ция *** Оригинальный путь к файлу с 'фала.lnk' ***
           getPath(file).then(path => {
             if(path.endsWith("exe")) {
                this.filePath = path
             } else {
               alert("Запустить можно только файлы '.exe'");
               this.$refs.drop.style.opacity = '';
             }
           });
         }else {
          alert("Запустить можно только файлы '.exe'");
         }
         
        this.$refs.drop.style.opacity = 0.8;
      },
      // Стили для секций(запрет или разрешение на перетаскивание)
      dragOnEnter(ev) {
         ev.preventDefault();
         if(ev.target.className === "drop" || ev.target.className === "drop--text") {
           this.$refs.drop.style.opacity = 0.6;
         } else {
            this.$refs.drop.style.opacity = '';
         }
      },
      // Запрет на перетаскивание
      dropCancel(ev) {
        ev.preventDefault();
      }
    },
    mounted() {
      //Чтение из ТипоБазыДанных
      if(fs.existsSync(process.cwd() + "\\"+DB_FILE)) {
        this.dbRead();
      }
      // Путь к файлу из Main process
      ipcRenderer.on('new-file', (event, fileContent) => {
        this.filePath = fileContent
      });
      // Очистка списка задач
      ipcRenderer.on('clear-file', () => {
        if(fs.existsSync(process.cwd() + "\\"+DB_FILE)) {
           fs.unlink(DB_FILE, (err) => {
            if (err) throw err;
            this.tasks = [];
          });
        }
      });
      // ПУТЬ К ПАПКЕ
      ipcRenderer.on('get-path-dir', (event, file) => {
        this.dirPath = file;
      });
      // Запуск задач из Трея
      ipcRenderer.on('run-from-main', this.runn);
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  .wrapper {
    user-select: none;
    display: flex;
    background: rgba(242,246,248,1);
    background: linear-gradient(135deg, rgba(242,246,248,1) 0%, rgba(216,225,231,1) 50%, rgba(181,198,208,1) 51%, rgba(224,239,249,1) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f2f6f8', endColorstr='#e0eff9', GradientType=1 );
    height: 100vh;
    width: 100vw;
  }
  .main {
    display: flex;
    flex-flow: column;
    width: 100%;   
  }
  /* TASK */
  .task{
    display: flex;
    width: 100%;
    height: 40px;
    justify-content: space-around;
    margin-top: 20px;
    margin-bottom: 30px;
  }
  /* FILE INFO PATH */
  .pathFile{
    height: 100px;
    color: aquamarine;
  }
  /* Button File */
  .myButton {
    outline: none;
	-moz-box-shadow:inset 0px 1px 0px 0px #ffffff;
	-webkit-box-shadow:inset 0px 1px 0px 0px #ffffff;
	box-shadow:inset 0px 1px 0px 0px #ffffff;
	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #f9f9f9), color-stop(1, #e9e9e9));
	background:-moz-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%);
	background:-webkit-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%);
	background:-o-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%);
	background:-ms-linear-gradient(top, #f9f9f9 5%, #e9e9e9 100%);
	background:linear-gradient(to bottom, #f9f9f9 5%, #e9e9e9 100%);
	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#f9f9f9', endColorstr='#e9e9e9',GradientType=0);
	background-color:#f9f9f9;
	-moz-border-radius:6px;
	-webkit-border-radius:6px;
	border-radius:6px;
	border:1px solid #dcdcdc;
	display:inline-block;
	cursor:pointer;
	color:#666666;
	font-family:Arial;
	font-size:15px;
	font-weight:bold;
	padding:6px 24px;
	text-decoration:none;
	text-shadow:0px 1px 0px #ffffff;
}
.myButton:hover {
	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #e9e9e9), color-stop(1, #f9f9f9));
	background:-moz-linear-gradient(top, #e9e9e9 5%, #f9f9f9 100%);
	background:-webkit-linear-gradient(top, #e9e9e9 5%, #f9f9f9 100%);
	background:-o-linear-gradient(top, #e9e9e9 5%, #f9f9f9 100%);
	background:-ms-linear-gradient(top, #e9e9e9 5%, #f9f9f9 100%);
	background:linear-gradient(to bottom, #e9e9e9 5%, #f9f9f9 100%);
	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#e9e9e9', endColorstr='#f9f9f9',GradientType=0);
	background-color:#e9e9e9;
}
.myButton:active {
	position:relative;
	top:1px;
}
/* ADD BUTTON */
.myButton__add{
  background: rgb(150, 171, 229);
  color: rgb(59, 53, 53);
}

.task--attr{
  border-color: #cccccc;
  padding: 9px;
  font-size: 18px;
  text-align: left;
  border-width: 4px;
  border-radius: 8px;
  border-style: groove;
  box-shadow: 2px 7px 11px 0px rgba(42,42,42,.74);
  text-shadow: 0px 0px 0px rgba(42,42,42,.75);
  font-weight: normal;
  outline: none;
}

/* Section INFO */
.tasks-info{
  position: relative;
  display: flex;
  flex: 4;
  width: 100%;
  height: 70%;
  padding: 10px 10px 0 10px;
  box-shadow: 0px 2px 5px 6px rgba(0,0,0,0.46);
}
/* runnTaskSection */
.runnTaskSection{
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
}
.myButton__run{
  height: 50px;
  background: rgb(110, 194, 107);
  color: "black"
}

/* LIST  */
.list{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  width: 100%;
  list-style: none;
}
.list--item{
  margin: 10px;
  box-shadow: inset -4px 0px 16px 1px rgba(204, 162, 162, 0.75);
  padding: 5px;
  max-height: 30px;
}

/* DROP SECTION  */
.drop{
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0.4;
  top: 0;
  left: 0;
  border: 5px dashed white;
}
.drop--text{
  color: white;
  font-size: 22px;
  font-family: Geneva, Arial, Helvetica, sans-serif;
  height: 100px;
}
/* ANIMATION */
.fade-enter-active, .fade-leave-active {
  animation: slideInUp .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
 animation: slideInUp .5s reverse;
}

.slideInUp {
  animation-name: slideInUp;
  animation-duration: 1s;
  animation-fill-mode: both;
  }
  @keyframes slideInUp {
  0% {
    transform: translateY(70%);
    visibility: visible;
    }
  100% {
    transform: translateY(0);
    }
  }

  /* ANIM BTN */
  .btn-enter-active, .btn-leave-active {
  transition: opacity .5s;
}
.btn-enter, .btn-leave-to{
  opacity: 0;
}
</style>