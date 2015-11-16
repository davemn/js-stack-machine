# JS Stack Machine

A tool to help you better understand how assembly, assemblers, and computer architectures work.

In broad strokes, this repo is the code behind a webpage implementing a [virtual stack machine](https://en.wikipedia.org/wiki/Stack_machine).
Batteries include:

* An assembly language spec
* An assembler
* A memory inspector

## Assembly Language Spec

**NOP** - No Operation  
Does nothing, and stops all current execution. 

**IMM<hex or dec>** - Push Immediate
Pushes an immediate value on the stack. 

**ADD** - Add
Adds the top two items on the stack, removing them. Places the result on the stack. 

**SUB** - Subtract. stack[top-1] - stack[top]
Subtracts the top of the stack from the next element, removing both. Places the result on the stack. 

**MUL** - Multiply
Multiplies the top of the stack with the next element, removing both. Places the result on the stack. 

**DIV** - Divide. stack[top-1] / stack[top]
Divides the next element from the top of the stack by the top of the stack, removing both. Places the result on the stack. 

**JMP<hex or dec address>** - Unconditional Jump
Sets the program counter, to move execution to the specified address. 

**BEQ<hex or dec address>** - Branch If Equal. stack[top-1] == stack[top]
Moves execution to the specified address, if the top two elements on the stack are equal. Both stack elements are removed. 

**BNE<hex or dec address>** - Branch If Not Equal. stack[top-1] != stack[top]
Moves execution to the specified address, if the top two elements on the stack are not equal. Both stack elements are removed. 

**LOD<hex or dec address>** - Load
Pushes the word at the given address onto the stack. 

**STO<hex or dec address>** - Store
Stores the word at the top of the stack at the given address. Remove the element at the top of the stack. 

## Assembler Options

Currently no options supported. Initiate with the "Assemble & Load" button.

## Memory Inspector

Currently shows the output of the assembler in hexadecimal. Will support executing the output in a coming release.
