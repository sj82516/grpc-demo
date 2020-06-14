const path = require('path');

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const toDoServiceImplementations = require('./implementations/todoService');

async function main() {
    const server = new grpc.Server();

    const PROTO_PATH = path.join(__dirname, './protos/todo.proto');
    const packageDefinition = protoLoader.loadSync(
        PROTO_PATH,
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
    const toDoProto = grpc.loadPackageDefinition(packageDefinition).ToDoService;

    server.addService(toDoProto.ToDoService.service, toDoServiceImplementations);
    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    server.start();
}

main();