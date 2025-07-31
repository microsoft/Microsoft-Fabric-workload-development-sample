

const HELLO_WORLD_SCHEMA_URI = "https://workload.host.com/schemas/HelloWorld/definition/1.0.0/schema.json";

/**
 * Interface for HelloWorld item definition
 */
export interface HelloWorldItemDefinition {
  $schema: string;
  message?: string;
}

/**
 * Factory function to create a HelloWorld item definition
 * @param message Optional message to initialize the definition
 * @returns HelloWorldItemDefinition object
 */
export function createHelloWorldDefinition(message?: string): HelloWorldItemDefinition {
  return {
    $schema: HELLO_WORLD_SCHEMA_URI,
    message: message
  };
}