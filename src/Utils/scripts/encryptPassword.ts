import bcrypt from "bcrypt";
import { logWithMessageAndStep } from "../Logger/logger";

const saltRounds = 10;


export async function encryptPassword(password: string,childLogger:any): Promise<string> {
  try {
    logWithMessageAndStep(childLogger, "Encrypt Password Step 1", "Generating salt for password encryption", "encryptPassword", {}, "info");
    const salt = await bcrypt.genSalt(saltRounds);

    logWithMessageAndStep(childLogger, "Encrypt Password Step 2", "Hashing password with generated salt", "encryptPassword", { salt: salt }, "info");
    const hash = await bcrypt.hash(password, salt);

    logWithMessageAndStep(childLogger, "Encrypt Password Step 3", "Password encryption successful", "encryptPassword", {}, "info");

    // Uncomment and add error handling for writing to file if needed
    // try {
    //   fs.writeFileSync("encrypted_password.txt", hash);
    //   logger.info("Encrypted password saved to encrypted_password.txt");
    // } catch (err) {
    //   logger.error("Error writing encrypted password to file:", err);
    // }

    return hash;
  } catch (error) {
    logWithMessageAndStep(childLogger, "Error Encrypt Password", "Error during password encryption", "encryptPassword", { error: JSON.stringify(error) }, "error");
    throw error;
  }
}