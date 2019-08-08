How to install:

1. Install node and npm

2. Install RabbitMQ or run:
	docker run --rm -p 5672:5672 -p 15672:15672 -d --hostname my-rabbit --name rabbit rabbitmq:3-management

3. npm install

How to use:

1. Make sure RabbitMQ is running and listening on port 5672

2. Run in separate terminals:
	node index.js
	node worker.js
	
3. To process 'text', go to:
	http://localhost:4000/process/text