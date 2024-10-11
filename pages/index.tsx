import { useState } from 'react';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { DataProtector } from '@iexec/dataprotector';

export default function Home() {
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const { toast } = useToast();

  const encryptMessage = async () => {
    try {
      const dataProtector = new DataProtector();
      const result = await dataProtector.protectData(message);
      setEncryptedMessage(result.protectedData);
      toast({
        title: 'Message Encrypted',
        description: 'Your message has been successfully encrypted.',
      });
    } catch (error) {
      console.error('Error encrypting message:', error);
      toast({
        title: 'Encryption Failed',
        description: 'An error occurred while encrypting your message.',
        variant: 'destructive',
      });
    }
  };

  const decryptMessage = async () => {
    try {
      const dataProtector = new DataProtector();
      const result = await dataProtector.decryptData(encryptedMessage);
      setDecryptedMessage(result.decryptedData);
      toast({
        title: 'Message Decrypted',
        description: 'Your message has been successfully decrypted.',
      });
    } catch (error) {
      console.error('Error decrypting message:', error);
      toast({
        title: 'Decryption Failed',
        description: 'An error occurred while decrypting your message.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Secret Messaging App</title>
        <meta name="description" content="Secure messaging using iExec Data Protector" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="space-y-8">
        <h1 className="text-3xl font-bold text-center">Secret Messaging App</h1>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Enter your secret message:</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>
          <Button onClick={encryptMessage}>Encrypt Message</Button>
        </div>

        {encryptedMessage && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="encrypted">Encrypted Message:</Label>
              <Input id="encrypted" value={encryptedMessage} readOnly />
            </div>
            <Button onClick={decryptMessage}>Decrypt Message</Button>
          </div>
        )}

        {decryptedMessage && (
          <div className="space-y-2">
            <Label htmlFor="decrypted">Decrypted Message:</Label>
            <Input id="decrypted" value={decryptedMessage} readOnly />
          </div>
        )}
      </main>
    </div>
  );
}