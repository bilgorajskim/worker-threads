# Worker threads

**Not stable yet, needs real tests etc. Use with caution.**

This library provides abstraction over Web Workers.

What it can do?

- Pub/Sub
- RPC

It exposes two APIs: **ThreadConnection** and **Thread**.

**ThreadConnection** is a direct abstraction over MessageChannel communication providing Pub/Sub and RPC.

A **Thread** is a container for multiple **ThreadConnections**. You could use just **ThreadConnection**, but **Thread** makes managing message and RPC handlers for multiple connections easier.

## Basic usage

To be written, see examples for now.

## Examples

See `examples`, particularly `advancedThreadRpc` showing how to link multiple threads together.