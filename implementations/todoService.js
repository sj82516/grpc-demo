const grpc = require('grpc');

let todoList = [
    { title: 'Hello', author: 'Hello2', isDone: true, createDate: 1.4 },
    { title: 'Hello2', author: 'Hello', isDone: true, createDate: 1.4 },
    { title: 'Hello3', author: 'Hello', isDone: true, createDate: 1.4 },
    { title: 'world', author: 'world', isDone: true, createDate: 1.4 },
    { title: 'world2', author: 'Hello', isDone: true, createDate: 1.4 },
    { title: 'world3', author: 'Hello2', isDone: null, createDate: "1.4" }
];

function CreateToDo(call, callback) {
    const clientToken = call.metadata.get('token')?.[0];
    if(clientToken !== 'Secret'){
        return callback({
            error: grpc.status.PERMISSION_DENIED,
            message: "No token"
        })
    }
    todoList.push(call.request);

    if(todoList.length > 5){
        return callback({
            error: grpc.status.OUT_OF_RANGE,
            message: "too many ToDoItem"
        })
    }

    callback(null, {
        ToDoList: todoList
    })
}

async function createMultiToDo(call, callback) {
    call.on('data', (data) => {
        todoList.push(data);
    })

    call.on('end', () => {
        callback(null, {});
    })
}

function GetToDoListByAuthor(call) {
    const author = call.request.author;

    async function main() {
        let isAny = false;
        for (const todoItem of todoList) {
            if (author === todoItem.author) {
                isAny = true;
                call.write(todoItem);
                await wait(1);
            }
        }

        if (isAny === false) {
            return call.emit('error', grpc.status.PERMISSION_DENIED)
        }

        call.end()
    }
    main()
}

async function GetToDoListByAuthorOnFly(call) {
    let author = null;
    call.on('data', (data) => {
        console.log(data)
        author = data.author;
        main();
    });

    call.on('end', () => {
        call.end();
    });

    async function main() {
        for (const todoItem of todoList) {
            if (author === todoItem.author) {
                call.write(todoItem);
            }
            await wait(3);
        }
    }
}

async function wait(sec) {
    return new Promise((res) => setTimeout(() => res(), sec * 1000));
}

module.exports = {
    CreateToDo,
    createMultiToDo,
    GetToDoListByAuthor,
    GetToDoListByAuthorOnFly,
}