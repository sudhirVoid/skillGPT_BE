"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const generate_1 = __importDefault(require("./routes/generate"));
const cors_1 = __importDefault(require("cors"));
const constants_1 = require("./constants/constants");
const db_1 = require("./controllers/db");
const app = (0, express_1.default)();
const port = constants_1.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// for all generating content from GPT we use this path requests.
app.use('/generate', generate_1.default);
// Add this error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.getPgVersion)();
}))();
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
exports.default = app;
