const amqp = require("amqplib");

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.queueName = "download_requests";
  }

  // Connect to RabbitMQ server
  async connect() {
    try {
      this.connection = await amqp.connect("amqp://user:password@localhost");
      console.log("Connected to RabbitMQ");
      return this.connection.createChannel();
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
      throw error;
    }
  }

  // Publish a message to the queue
  async publishMessage(message) {
    try {
      if (!this.connection) {
        this.channel = await this.connect();
      }
      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
    } catch (error) {
      console.error("Error publishing message to RabbitMQ:", error);
      throw error;
    }
  }
}

module.exports = new RabbitMQService();
