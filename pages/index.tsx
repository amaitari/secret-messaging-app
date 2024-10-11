import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { IExecDataProtector } from "@iexec/dataprotector";
import { ethers } from "ethers";
import { useTheme } from "next-themes";
import { Moon, Sun, Lock, Unlock, Send } from "lucide-react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const checkMetaMask = async () => {
      if (
        typeof window !== "undefined" &&
        typeof window.ethereum !== "undefined"
      ) {
        setIsMetaMaskInstalled(true);
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          setIsWalletConnected(accounts.length > 0);
        } catch (error) {
          console.error("Error checking wallet connection:", error);
          logError("Error checking wallet connection", error);
        }
      } else {
        setIsMetaMaskInstalled(false);
        console.warn("MetaMask is not installed");
      }
    };

    checkMetaMask();

    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error);
      logError("An unexpected error occurred", event.error);
    };

    window.addEventListener("error", handleGlobalError);

    return () => {
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  const logError = (message: string, error: any) => {
    console.error(message, error);
    toast({
      title: "Error",
      description: `${message}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      variant: "destructive",
    });
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      toast({
        title: "MetaMask Not Detected",
        description: "Please install MetaMask to use this app.",
        variant: "destructive",
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setIsWalletConnected(true);
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected.",
        });
      } else {
        throw new Error("No accounts found");
      }
    } catch (error) {
      logError("Error connecting wallet", error);
    }
  };

  const encryptMessage = async () => {
    if (!message) {
      toast({
        title: "Error",
        description: "Please enter a message to encrypt.",
        variant: "destructive",
      });
      return;
    }

    if (!isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const dataProtector = new IExecDataProtector(window.ethereum);

      console.log("Encrypting message:", message);
      const protectedData = await dataProtector.protectData({
        data: { message },
        name: "Secret Message",
      });

      console.log("Encryption result:", protectedData);
      setEncryptedMessage(protectedData.address);
      toast({
        title: "Message Encrypted",
        description: "Your message has been encrypted successfully.",
      });
    } catch (error) {
      logError("Error encrypting message", error);
    }
  };

  const decryptMessage = async () => {
    if (!encryptedMessage) {
      toast({
        title: "Error",
        description: "Please encrypt a message first.",
        variant: "destructive",
      });
      return;
    }

    if (!isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const dataProtector = new IExecDataProtector(window.ethereum);

      console.log("Decrypting message:", encryptedMessage);
      const decrypted = await dataProtector.fetchProtectedData(
        {
          requiredSchema: {
            message: "string",
          }
        }
        
      );
      console.log("Decryption result:", decrypted);
      setDecryptedMessage(decrypted[0]);
      toast({
        title: "Message Decrypted",
        description: "Your message has been decrypted successfully.",
      });
    } catch (error) {
      logError("Error decrypting message", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Secret Messaging
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {!isMetaMaskInstalled && (
          <div
            className="bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded"
            role="alert"
          >
            <p className="font-bold">MetaMask Not Detected</p>
            <p>Please install MetaMask to use this app.</p>
          </div>
        )}

        <Button
          onClick={connectWallet}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!isMetaMaskInstalled || isWalletConnected}
        >
          {isWalletConnected ? "Wallet Connected" : "Connect Wallet"}
        </Button>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">
            Message
          </Label>
          <Input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your secret message"
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="recipient"
            className="text-gray-700 dark:text-gray-300"
          >
            Recipient Address (optional)
          </Label>
          <Input
            id="recipient"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter recipient's Ethereum address"
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={encryptMessage}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={!isWalletConnected || !message}
          >
            <Lock className="mr-2 h-4 w-4" /> Encrypt
          </Button>
          <Button
            onClick={decryptMessage}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!isWalletConnected || !encryptedMessage}
          >
            <Unlock className="mr-2 h-4 w-4" /> Decrypt
          </Button>
        </div>

        {encryptedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <Label className="text-gray-700 dark:text-gray-300">
              Encrypted Message Address
            </Label>
            <Input
              value={encryptedMessage}
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </motion.div>
        )}

        {decryptedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <Label className="text-gray-700 dark:text-gray-300">
              Decrypted Message
            </Label>
            <Input
              value={decryptedMessage}
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </motion.div>
        )}

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
          disabled={
            !isWalletConnected || !encryptedMessage || !recipientAddress
          }
        >
          <Send className="mr-2 h-4 w-4" /> Send Encrypted Message
        </Button>
      </motion.div>
    </div>
  );
}