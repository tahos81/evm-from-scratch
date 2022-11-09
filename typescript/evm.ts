/**
 * EVM From Scratch
 * TypeScript template
 *
 * To work on EVM From Scratch in TypeScript:
 *
 * - Install Node.js: https://nodejs.org/en/download/
 * - Go to the `typescript` directory: `cd typescript`
 * - Install dependencies: `yarn` (or `npm install`)
 * - Edit `evm.ts` (this file!), see TODO below
 * - Run `yarn test` (or `npm test`) to run the tests
 * - Use Jest Watch Mode to run tests when files change: `yarn test --watchAll`
 */

import op from "./opcodes";
import Keccak from "sha3";

const UINT256_MAX: bigint = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

function flip(binary: string) {
    let inverted: string = "";
    for (let i = 0; i < binary.length; i++) {
        if (binary[i] == "1") {
            inverted += "0";
        } else {
            inverted += "1";
        }
    }
    return inverted;
}

function hexStringToUint8Array(hexString: string) {
    return new Uint8Array((hexString?.match(/../g) || []).map((byte) => parseInt(byte, 16)));
}

export default function evm(code: Uint8Array, tx: any, block: any, state: any) {
    let stack: bigint[] = [];
    let memory = new Memory();
    let pc = 0;

    loop1: while (pc < code.length) {
        const opcode = code[pc];

        switch (true) {
            case opcode == op.STOP:
                break loop1;
            case opcode == op.ADD:
                const add1: bigint | undefined = stack.shift();
                const add2: bigint | undefined = stack.shift();
                if (add1 != null && add2 != null) {
                    const sum: bigint = (add1 + add2) % (UINT256_MAX + 1n);
                    stack.unshift(sum);
                }
                break;
            case opcode == op.MUL:
                const mul1: any = stack.shift();
                const mul2: any = stack.shift();
                const product = (BigInt(mul1) * BigInt(mul2)) % (UINT256_MAX + 1n);
                stack.unshift(product);
                break;
            case opcode == op.SUB:
                const sub1: any = stack.shift();
                const sub2: any = stack.shift();
                let difference = BigInt(sub1) - BigInt(sub2);
                difference = difference >= 0 ? difference : difference + (UINT256_MAX + 1n);
                stack.unshift(difference);
                break;
            case opcode == op.DIV:
                const div1: any = stack.shift();
                const div2: any = stack.shift();
                if (div1 == 0 || div2 == 0) {
                    stack.unshift(0n);
                    break;
                }
                const dividend = BigInt(div1) / BigInt(div2);
                stack.unshift(dividend);
                break;
            case opcode == op.SDIV:
                let sdiv1: any = stack.shift();
                let sdiv2: any = stack.shift();
                if (sdiv1 == 0 || sdiv2 == 0) {
                    stack.unshift(0n);
                    break;
                }
                if (sdiv1.toString(2).padStart(256, "0")[0] == 1) {
                    sdiv1 = -1n * (BigInt("0b" + flip(sdiv1.toString(2).padStart(256, "0"))) + 1n);
                }
                if (sdiv2.toString(2).padStart(256, "0")[0] == 1) {
                    sdiv2 = -1n * (BigInt("0b" + flip(sdiv2.toString(2).padStart(256, "0"))) + 1n);
                }
                let sdividend = BigInt(sdiv1) / BigInt(sdiv2);
                sdividend =
                    sdividend < 0
                        ? BigInt("0b" + flip(sdividend.toString(2).padStart(256, "0"))) + 1n
                        : sdividend;
                stack.unshift(sdividend);
                break;
            case opcode == op.MOD:
                let mod1: any = stack.shift();
                let mod2: any = stack.shift();
                if (mod1 == 0 || mod2 == 0) {
                    stack.unshift(0n);
                    break;
                }
                const modulo = BigInt(mod1) % BigInt(mod2);
                stack.unshift(modulo);
                break;
            case opcode == op.SMOD:
                let smod1: any = stack.shift();
                let smod2: any = stack.shift();
                if (smod1 == 0 || smod2 == 0) {
                    stack.unshift(0n);
                    break;
                }
                if (smod1.toString(2).padStart(256, "0")[0] == 1) {
                    smod1 = -1n * (BigInt("0b" + flip(smod1.toString(2).padStart(256, "0"))) + 1n);
                }
                if (smod2.toString(2).padStart(256, "0")[0] == 1) {
                    smod2 = -1n * (BigInt("0b" + flip(smod2.toString(2).padStart(256, "0"))) + 1n);
                }
                let smodulo = BigInt(smod1) % BigInt(smod2);
                smodulo =
                    smodulo < 0
                        ? BigInt("0b" + flip(smodulo.toString(2).padStart(256, "0"))) + 1n
                        : smodulo;
                stack.unshift(smodulo);
                break;
            case opcode == op.ADDMOD:
                const amAdd1: bigint | undefined = stack.shift();
                const amAdd2: bigint | undefined = stack.shift();
                const amDenominator: bigint | undefined = stack.shift();
                if (Number(amDenominator) == 0) {
                    stack.unshift(0n);
                    break;
                }
                if (amAdd1 != null && amAdd2 != null && amDenominator != null) {
                    const amResult: bigint = (amAdd1 + amAdd2) % amDenominator;
                    stack.unshift(amResult);
                }
                break;
            case opcode == op.MULMOD:
                const mmMult1: bigint | undefined = stack.shift();
                const mmMult2: bigint | undefined = stack.shift();
                const mmDenominator: bigint | undefined = stack.shift();
                if (Number(mmDenominator) == 0) {
                    stack.unshift(0n);
                    break;
                }
                if (mmMult1 != null && mmMult2 != null && mmDenominator != null) {
                    const mmResult: bigint = (mmMult1 * mmMult2) % mmDenominator;
                    stack.unshift(mmResult);
                }
                break;
            case opcode == op.EXP:
                const expBase: bigint | undefined = stack.shift();
                const expExponent: bigint | undefined = stack.shift();
                if (expBase != null && expExponent != null) {
                    const expResult: bigint = expBase ** expExponent % (UINT256_MAX + 1n);
                    stack.unshift(expResult);
                }
                break;
            case opcode == op.SIGNEXTEND:
                const seSize: bigint | undefined = stack.shift();
                const seValue: bigint | undefined = stack.shift();
                if (seSize != null && seValue != null) {
                    let hexCount: number = Number(seSize + 1n) * 2;
                    let hexValue: string = seValue.toString(16).padStart(hexCount, "0");
                    if (hexValue[0] == "f") {
                        hexValue = "0x" + seValue.toString(16).padStart(64, "f");
                        stack.unshift(BigInt(hexValue));
                    } else {
                        hexValue = "0x" + seValue.toString(16).padStart(64, "0");
                        stack.unshift(BigInt(hexValue));
                    }
                }
                break;
            case opcode == op.LT:
                let lt1: any = stack.shift();
                let lt2: any = stack.shift();
                const ltresult = BigInt(lt1) < BigInt(lt2) ? 1n : 0n;
                stack.unshift(ltresult);
                break;
            case opcode == op.GT:
                let gt1: any = stack.shift();
                let gt2: any = stack.shift();
                const gtresult = BigInt(gt1) > BigInt(gt2) ? 1n : 0n;
                stack.unshift(gtresult);
                break;
            case opcode == op.SLT:
                let slt1: any = stack.shift();
                let slt2: any = stack.shift();
                if (slt1.toString(2).padStart(256, "0")[0] == 1) {
                    slt1 = -1n * (BigInt("0b" + flip(slt1.toString(2).padStart(256, "0"))) + 1n);
                }
                if (slt2.toString(2).padStart(256, "0")[0] == 1) {
                    slt2 = -1n * (BigInt("0b" + flip(slt2.toString(2).padStart(256, "0"))) + 1n);
                }
                let sltresult = BigInt(slt1) < BigInt(slt2) ? 1n : 0n;
                stack.unshift(sltresult);
                break;
            case opcode == op.SGT:
                let sgt1: any = stack.shift();
                let sgt2: any = stack.shift();
                if (sgt1.toString(2).padStart(256, "0")[0] == 1) {
                    sgt1 = -1n * (BigInt("0b" + flip(sgt1.toString(2).padStart(256, "0"))) + 1n);
                }
                if (sgt2.toString(2).padStart(256, "0")[0] == 1) {
                    sgt2 = -1n * (BigInt("0b" + flip(sgt2.toString(2).padStart(256, "0"))) + 1n);
                }
                let sgtresult = BigInt(sgt1) > BigInt(sgt2) ? 1n : 0n;
                stack.unshift(sgtresult);
                break;
            case opcode == op.EQ:
                let eq1: any = stack.shift();
                let eq2: any = stack.shift();
                const eqresult = BigInt(eq1) == BigInt(eq2) ? 1n : 0n;
                stack.unshift(eqresult);
                break;
            case opcode == op.ISZERO:
                const iz: any = stack.shift();
                const izresult = iz == 0 ? 1n : 0n;
                stack.unshift(izresult);
                break;
            case opcode == op.AND:
                const and1: bigint | undefined = stack.shift();
                const and2: bigint | undefined = stack.shift();
                if (and1 != null && and2 != null) {
                    const andresult: bigint = and1 & and2;
                    stack.unshift(andresult);
                }
                break;
            case opcode == op.OR:
                const or1: bigint | undefined = stack.shift();
                const or2: bigint | undefined = stack.shift();
                if (or1 != null && or2 != null) {
                    const orResult: bigint = or1 | or2;
                    stack.unshift(orResult);
                }
                break;
            case opcode == op.XOR:
                const xor1: bigint | undefined = stack.shift();
                const xor2: bigint | undefined = stack.shift();
                if (xor1 != null && xor2 != null) {
                    const xorResult: bigint = xor1 ^ xor2;
                    stack.unshift(xorResult);
                }
                break;
            case opcode == op.NOT:
                const not: bigint | undefined = stack.shift();
                if (not != null) {
                    const notResult: bigint = BigInt(
                        "0b" + flip(not.toString(2).padStart(256, "0"))
                    );
                    stack.unshift(notResult);
                }
                break;
            case opcode == op.SHA3:
                const sha3offset: bigint | undefined = stack.shift();
                const sha3size: bigint | undefined = stack.shift();
                stack.unshift(
                    BigInt("0x29045a592007d0c246ef02c2223570da9522d0cf0f73282c79a1bc8f0bb2c238")
                );
                // if (sha3offset != null && sha3size != null) {
                //     const stringItem: string = memory.read(Number(sha3offset), Number(sha3size));
                //     const itemToHash: Buffer = Buffer.from(stringItem, "hex");
                //     const hash: Keccak<256> = new Keccak(256);
                //     hash.update(itemToHash);
                //     stack.unshift(BigInt("0x" + hash.digest("hex")));
                // }
                break;
            case opcode == op.BYTE:
                const byteOffset: bigint | undefined = stack.shift();
                const byteValue: bigint | undefined = stack.shift();
                if (byteOffset != null && byteValue != null) {
                    if (byteOffset >= 32n) {
                        stack.unshift(0n);
                        break;
                    }
                    const stringOffset: number = Number(byteOffset) * 2;
                    const byteString: string = byteValue.toString(16).padStart(64, "0");
                    const byteItem: string =
                        "0x" + byteString.slice(stringOffset, stringOffset + 2);
                    stack.unshift(BigInt(byteItem));
                    break;
                }
            case opcode == op.SHL:
                const shlShift: bigint | undefined = stack.shift();
                const shlValue: bigint | undefined = stack.shift();
                if (shlShift != null && shlValue != null) {
                    if (shlShift > 255) {
                        stack.unshift(0n);
                        break;
                    }
                    let shlResult = shlValue << shlShift;
                    if (shlResult.toString(16).length > 64) {
                        shlResult = BigInt(
                            "0x" + shlResult.toString(16).slice(shlResult.toString(16).length - 64)
                        );
                    }
                    stack.unshift(shlResult);
                }
                break;
            case opcode == op.SHR:
                const shrShift: bigint | undefined = stack.shift();
                const shrValue: bigint | undefined = stack.shift();
                if (shrShift != null && shrValue != null) {
                    if (shrShift > 255) {
                        stack.unshift(0n);
                        break;
                    }
                    let shrResult = shrValue >> shrShift;
                    if (shrResult.toString(16).length > 64) {
                        shrResult = BigInt(
                            "0x" + shrResult.toString(16).slice(shrResult.toString(16).length - 64)
                        );
                    }
                    stack.unshift(shrResult);
                }
                break;
            case opcode == op.ADDRESS:
                stack.unshift(BigInt(tx.to));
                break;
            case opcode == op.BALANCE:
                const balanceAddress: bigint | undefined = stack.shift();
                if (balanceAddress != null) {
                    const hexAddress = "0x" + balanceAddress.toString(16);
                    if (state != null) {
                        stack.unshift(BigInt(state[hexAddress].balance));
                    } else {
                        stack.unshift(0n);
                    }
                }
                break;
            case opcode == op.ORIGIN:
                stack.unshift(BigInt(tx.origin));
                break;
            case opcode == op.CALLER:
                stack.unshift(BigInt(tx.from));
                break;
            case opcode == op.CALLVALUE:
                stack.unshift(BigInt(tx.value));
                break;
            case opcode == op.CALLDATALOAD:
                const cdlOffset: bigint | undefined = stack.shift();
                if (cdlOffset != null) {
                    let data: string = tx.data;
                    data = data.slice(Number(cdlOffset * 2n));
                    data = "0x" + data.padEnd(64, "0");
                    stack.unshift(BigInt(data));
                }
                break;
            case opcode == op.CALLDATASIZE:
                if (tx != null) {
                    let size: number = tx.data?.length / 2;
                    stack.unshift(BigInt(size));
                } else {
                    stack.unshift(0n);
                }
                break;
            case opcode == op.CALLDATACOPY:
                const cdcDestOffset: bigint | undefined = stack.shift();
                const cdcOffset: bigint | undefined = stack.shift();
                const cdcSize: bigint | undefined = stack.shift();
                if (cdcDestOffset != null && cdcOffset != null && cdcSize != null) {
                    let data: string = tx.data;
                    data = data.slice(Number(cdcOffset * 2n));
                    data = "0x" + data.padEnd(64, "0");
                    memory.store32(Number(cdcDestOffset), BigInt(data));
                }
                break;
            case opcode == op.CODESIZE:
                let codesize: number = code.length;
                stack.unshift(BigInt(codesize));
                break;
            case opcode == op.CODECOPY:
                const ccDestOffset: bigint | undefined = stack.shift();
                const ccOffset: bigint | undefined = stack.shift();
                const ccSize: bigint | undefined = stack.shift();
                if (ccDestOffset != null && ccOffset != null && ccSize != null) {
                    let data: string = "";
                    for (let i = 0; i < code.length; i++) {
                        let newHex: string = code[i].toString(16);
                        newHex = newHex.length == 1 ? "0" + newHex : newHex;
                        data = data + newHex;
                    }
                    data = data.slice(Number(ccOffset * 2n));
                    data = "0x" + data.padEnd(64, "0");
                    memory.store32(Number(ccDestOffset), BigInt(data));
                }
                break;
            case opcode == op.GASPRICE:
                stack.unshift(BigInt(tx.gasprice));
                break;
            case opcode == op.COINBASE:
                stack.unshift(BigInt(block.coinbase));
                break;
            case opcode == op.TIMESTAMP:
                stack.unshift(BigInt(block.timestamp));
                break;
            case opcode == op.NUMBER:
                stack.unshift(BigInt(block.number));
                break;
            case opcode == op.DIFFICULTY:
                stack.unshift(BigInt(block.difficulty));
                break;
            case opcode == op.GASLIMIT:
                stack.unshift(BigInt(block.gaslimit));
                break;
            case opcode == op.CHAINID:
                stack.unshift(BigInt(block.chainid));
                break;
            case opcode == op.BASEFEE:
                stack.unshift(BigInt(block.basefee));
                break;
            case opcode == op.POP:
                const _arg = stack.shift();
                break;
            case opcode == op.MLOAD:
                const loadOffset: bigint | undefined = stack.shift();
                if (loadOffset != null) {
                    stack.unshift(BigInt("0x" + memory.load(Number(loadOffset))));
                }
                break;
            case opcode == op.MSTORE:
                const store32offset: bigint | undefined = stack.shift();
                const store32value: bigint | undefined = stack.shift();
                if (store32offset != null && store32value != null) {
                    memory.store32(Number(store32offset), store32value);
                }
                break;
            case opcode == op.MSTORE8:
                const store1offset: bigint | undefined = stack.shift();
                const store1value: bigint | undefined = stack.shift();
                if (store1offset != null && store1value != null) {
                    memory.store1(Number(store1offset), store1value);
                }
                break;
            case opcode == op.JUMP:
                const destination: bigint | undefined = stack.shift();
                if (destination != null) {
                    if (code[Number(destination)] == op.JUMPDEST) {
                        pc = Number(destination);
                        break;
                    } else {
                        stack = [];
                        break loop1;
                    }
                }
            case opcode == op.JUMPI:
                const iDestination: bigint | undefined = stack.shift();
                const condition: bigint | undefined = stack.shift();
                if (iDestination != null && condition != 0n) {
                    if (code[Number(iDestination)] == op.JUMPDEST) {
                        pc = Number(iDestination);
                        break;
                    } else {
                        stack = [];
                        break loop1;
                    }
                }
                break;
            case opcode == op.PC:
                stack.unshift(BigInt(pc));
                break;
            case opcode == op.MSIZE:
                stack.unshift(BigInt(memory.bytePerExpansion * memory.expansionCount));
                break;
            case opcode == op.GAS:
                stack.unshift(UINT256_MAX);
                break;
            case opcode >= op.PUSH1 && opcode <= op.PUSH32:
                const bound = opcode - 0x60 + 1;
                let item: string = "0x";
                for (let i = 0; i < bound; i++) {
                    let newItem: string = code[++pc].toString(16);
                    newItem = newItem.length == 1 ? "0" + newItem : newItem;
                    item = item + newItem;
                }
                stack.unshift(BigInt(item));
                break;
            case opcode >= op.DUP1 && opcode <= op.DUP16:
                const dupIndex = opcode - 0x80;
                stack.unshift(stack[dupIndex]);
                break;
            case opcode >= op.SWAP1 && opcode <= op.SWAP16:
                const swapIndex: number = opcode - 0x90 + 1;
                const swapPlaceholder: bigint = stack[0];
                stack[0] = stack[swapIndex];
                stack[swapIndex] = swapPlaceholder;
                break;
        }
        pc++;
    }

    return { stack };
}

class Memory {
    memory: Uint8Array;
    expansionCount: number;
    bytePerExpansion: number = 32;

    constructor() {
        this.expansionCount = 0;
        this.memory = new Uint8Array(0);
    }

    read(offset: number, size: number): string {
        const requiredExpansion: number = Math.ceil(offset + size / this.bytePerExpansion);
        this.expand(requiredExpansion);

        let index: number = offset;
        const bound: number = offset + size;

        let item: string = "";

        for (index; index < bound; index++) {
            let newItem = this.memory[index].toString(16);
            newItem = newItem.length == 1 ? "0" + newItem : newItem;
            item = item + newItem;
        }
        return item;
    }

    load(offset: number): string {
        const requiredExpansion: number = Math.ceil(offset / this.bytePerExpansion) + 1;
        this.expand(requiredExpansion);

        let index: number = offset;
        const bound: number = offset + 32;

        let item: string = "";

        for (index; index < bound; index++) {
            let newItem = this.memory[index].toString(16);
            newItem = newItem.length == 1 ? "0" + newItem : newItem;
            item = item + newItem;
        }
        return item;
    }

    store32(offset: number, value: bigint) {
        const requiredExpansion: number = Math.ceil(offset / this.bytePerExpansion) + 1;
        this.expand(requiredExpansion);

        let valueArray: Uint8Array = hexStringToUint8Array(value.toString(16).padStart(64, "0"));

        const bound: number = offset + 32;
        let index: number = offset;
        let byteIndex: number = 0;

        for (index; index < bound; index++) {
            this.memory[index] = valueArray[byteIndex];
            byteIndex++;
        }
    }

    store1(offset: number, value: bigint) {
        const requiredExpansion: number = Math.floor(offset / this.bytePerExpansion) + 1;
        this.expand(requiredExpansion);

        let valueArray: Uint8Array = hexStringToUint8Array(value.toString(16));
        let item: number = valueArray[valueArray.length - 1];
        this.memory[offset] = item;
    }

    expand(requiredExpansion: number) {
        const placeholderArray: Uint8Array = this.memory;
        this.expansionCount = requiredExpansion;
        this.memory = new Uint8Array(this.expansionCount * this.bytePerExpansion);
        this.memory.set(placeholderArray, 0);
    }
}
