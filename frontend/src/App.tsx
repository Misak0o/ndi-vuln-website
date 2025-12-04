import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CssBaseline, TextField, Button, Alert, Paper, ThemeProvider, createTheme, Accordion, AccordionSummary, AccordionDetails, Divider, Drawer, Fab } from '@mui/material';
import { ExpandMore, BugReport, VpnKey, Build, Send, Adb, Info } from '@mui/icons-material';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import VictoryPage from './components/VictoryPage';
import VulnerabilityReportPage from './components/VulnerabilityReportPage';

// --- Thème "Hacker Cool" ---
const hackerTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00ff7f' }, // SpringGreen
    background: { default: '#0d1117', paper: '#161b22' },
  },
  typography: { fontFamily: '"Fira Code", "Roboto Mono", monospace' },
});

// --- Fonctions d'aide & Composants ---
const prettyPrintJson = (jsonString: string) => {
  try { return JSON.stringify(JSON.parse(jsonString), null, 2); }
  catch { return "Données invalides."; }
};

const HackerAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [text, setText] = useState('');
  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let interval: NodeJS.Timeout;
    const timeout = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 3000);
    interval = setInterval(() => {
      let randomText = '';
      for (let i = 0; i < 200; i++) randomText += chars.charAt(Math.floor(Math.random() * chars.length));
      setText(randomText);
    }, 50);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [onComplete]);
  return <pre style={{ color: '#00ff7f', whiteSpace: 'pre-wrap', wordBreak: 'break-all', height: '100px', overflowY: 'hidden', background: '#000', padding:'8px' }}>{text}</pre>;
};

const App: React.FC = () => {
  // États de la mission
  const [currentMissionStep, setCurrentMissionStep] = useState(0);
  const [initialToken, setInitialToken] = useState('');
  const [finalToken, setFinalToken] = useState('');
  const [attackResult, setAttackResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [missionSuccess, setMissionSuccess] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // États des outils
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [decoderInput, setDecoderInput] = useState('');
  const [decodedHeader, setDecodedHeader] = useState('');
  const [decodedPayload, setDecodedPayload] = useState('');
  const [isCracking, setIsCracking] = useState(false);
  const [crackedSecret, setCrackedSecret] = useState('');
  const [forgePayload, setForgePayload] = useState('');
  const [forgeSecret, setForgeSecret] = useState('');
  const [forgedToken, setForgedToken] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);
  const [initialTokenCopied, setInitialTokenCopied] = useState(false);

  // --- Logique des outils ---
  useEffect(() => { // Décodeur live
    if (!decoderInput.includes('.') || decoderInput.split('.').length < 2) { setDecodedHeader(''); setDecodedPayload(''); return; }
    try {
      const [h, p] = decoderInput.split('.');
      setDecodedHeader(prettyPrintJson(atob(h.replace(/-/g, '+').replace(/_/g, '/'))));
      setDecodedPayload(prettyPrintJson(atob(p.replace(/-/g, '+').replace(/_/g, '/'))));
    } catch { setDecodedHeader("Erreur"); setDecodedPayload("Erreur"); }
  }, [decoderInput]);
  
  const handleForge = () => {
    try {
      const header = { "alg": "HS256", "typ": "JWT" };
      const base64url = (source: any) => Base64.stringify(source).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      const encodedHeader = base64url(Utf8.parse(JSON.stringify(header)));
      const encodedPayload = base64url(Utf8.parse(forgePayload));
      const signature = base64url(HmacSHA256(`${encodedHeader}.${encodedPayload}`, forgeSecret));
      setForgedToken(`${encodedHeader}.${encodedPayload}.${signature}`);
    } catch { alert('Le Payload doit être un JSON valide ! Ex: {"cle": "valeur"}'); }
  };

  // --- Logique de la mission principale ---
  useEffect(() => { // Démarrage
    fetch('http://localhost:8000/').then(res => res.json()).then(data => setInitialToken(data.token || '')).catch(() => {
       setAttackResult({ type: 'error', message: "ERREUR: Backend non démarré." });
    });
  }, []);
  
  const handleAttack = async () => {
    setAttackResult(null);
    try {
      const response = await fetch('http://localhost:8000/admin', { headers: { 'Authorization': `Bearer ${finalToken}` } });
      const data = await response.json();
      setAttackResult({ type: response.ok ? 'success' : 'error', message: `${data.detail || data.message}` });
      if(response.ok) setMissionSuccess(true);
    } catch (err) { setAttackResult({ type: 'error', message: 'Erreur réseau.' }); }
  };
  
  if (missionSuccess && attackResult) {
    return (
      <ThemeProvider theme={hackerTheme}>
        <CssBaseline />
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
          <VictoryPage message={attackResult.message} />
        </Container>
      </ThemeProvider>
    );
  }

  const MissionStepContent: React.FC<{ step: number }> = ({ step }) => {
    switch (step) {
      case 0: return (
        <>
          <Typography variant="h5" color="primary" gutterBottom>Transmission Entrante...</Typography>
          <Typography sx={{ mt: 2, mb: 3, whiteSpace: 'pre-line' }}>
            {`Année 2077. Le monde est sous le joug de conglomérats impitoyables. Parmi eux, Le Cartel du Café Court (CCC) a le monopole sur la ressource la plus précieuse : le café.

            Ils ont déployé des machines à café "intelligentes" dans toutes les villes, contrôlées par un système de jetons JWT prétendument inviolable. Mais une faction de rebelles, les "Libérateurs de la Caféine", a découvert une potentielle faille.
            
            Vous êtes leur meilleur agent, un cyber-mercenaire connu sous le nom de "Barista Furtif". Votre mission, si vous l'acceptez : infiltrer le réseau de la CCC, briser la sécurité de leur système JWT, et libérer la caféine pour le peuple. L'avenir du réveil matinal de millions de personnes repose sur vos épaules.`}
          </Typography>
          <Button variant="contained" onClick={() => setCurrentMissionStep(1)} sx={{ mt: 2 }}>Accepter la Mission</Button>
        </>
      );
      case 1: return (
        <>
          <Typography variant="h6" color="primary">Objectif 1: Investigation</Typography>
          <Typography sx={{ mt: 1 }}>Agent, la machine à café est en état critique. Le système de contrôle de la CCC a été repéré. Voici un token que nous avons intercepté.</Typography>
          <TextField 
            label={initialTokenCopied ? "Token Copié !" : "Token Intercepté (cliquez pour copier)"}
            value={initialToken} 
            fullWidth 
            margin="normal" 
            InputProps={{ readOnly: true }} 
            onClick={() => {
              navigator.clipboard.writeText(initialToken);
              setInitialTokenCopied(true);
              setTimeout(() => setInitialTokenCopied(false), 2000);
            }}
            sx={{ cursor: 'pointer' }}
          />
          <Typography sx={{ mt: 1 }}>Ce token contient sûrement des informations cruciales. Ouvrez la "Boîte à Outils" (bouton <Build /> en haut à droite), utilisez le "Décodeur JWT" pour l'analyser. Le champ "role" devrait nous donner une piste.</Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => setCurrentMissionStep(0)}>Retour au Briefing</Button>
            <Button variant="contained" onClick={() => setCurrentMissionStep(2)} sx={{ flexGrow: 1 }} disabled={!decodedPayload || decoderInput !== initialToken}>Poursuivre l'enquête</Button>
          </Box>
        </>
      );
      case 2: return (
        <>
          <Typography variant="h6" color="primary">Objectif 2: Infiltration et Prise de Contrôle</Typography>
          <Typography sx={{ mt: 1 }}>Le payload montre que vous êtes un "guest". Pour changer ça, il nous faut le <strong>secret de signature</strong>. Utilisez le "Bruteforcer" dans la Boîte à Outils pour le trouver.</Typography>
          <Typography sx={{ mt: 1 }}>Une fois le secret obtenu, forgez un nouveau token. Le payload initial était <code>{`{"role":"guest"}`}</code>. Vous devez trouver le bon rôle pour prendre le contrôle. Les développeurs ont peut-être laissé un indice quelque part... <strong>regardez bien le code source de cette page !</strong></Typography>
          <Typography sx={{ mt: 1, fontStyle: 'italic' }}>Une fois le token forgé avec le bon rôle, copiez-le et collez-le ci-dessous pour l'assaut final.</Typography>
          
          <TextField label="Token de Contrôle (collez ici)" value={finalToken} onChange={(e) => setFinalToken(e.target.value)} fullWidth margin="normal" sx={{mt: 3}} disabled={!crackedSecret} />
          <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => setCurrentMissionStep(1)}>Retour</Button>
            <Button variant="contained" color="error" onClick={handleAttack} sx={{ flexGrow: 1 }} disabled={!finalToken}>Prendre le Contrôle de la Machine</Button>
          </Box>
          {attackResult && <Alert severity={attackResult.type} sx={{ mt: 2 }}>{attackResult.message}</Alert>}
        </>
      );
      default: return <Typography>Mission accomplie !</Typography>;
    }
  };

  // INDICE: Pour prendre le contrôle, le payload doit être {"role": "admin"}
  return (
    <ThemeProvider theme={hackerTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fab color="primary" sx={{ position: 'fixed', top: 16, right: 16 }} onClick={() => setIsToolboxOpen(true)}>
          <Build />
        </Fab>
        <Fab color="secondary" sx={{ position: 'fixed', bottom: 16, left: 16 }} onClick={() => setShowReport(true)}>
          <Info />
        </Fab>
        
        {showReport && <VulnerabilityReportPage onClose={() => setShowReport(false)} />}

        <Paper elevation={12} sx={{ p: 4, borderColor: 'primary.main', borderWidth: '1px', borderStyle: 'solid' }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}><BugReport color="primary" sx={{ fontSize: 40 }} /><Typography variant="h4" component="h1">Le Casse du Café</Typography></Box>
          <Divider sx={{ mb: 4 }} />
          <MissionStepContent step={currentMissionStep} />
        </Paper>

        {/* Barre d'outils latérale */}
        <Drawer anchor="right" open={isToolboxOpen} onClose={() => setIsToolboxOpen(false)}>
          <Box sx={{ width: 400, p: 2 }}>
            <Typography variant="h5" gutterBottom>Boîte à Outils</Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}><VpnKey sx={{mr:1}}/> <Typography>Décodeur JWT</Typography></AccordionSummary>
              <AccordionDetails>
                <TextField label="Collez un JWT ici" value={decoderInput} onChange={(e) => setDecoderInput(e.target.value)} fullWidth multiline rows={4} margin="normal" />
                <Typography variant="subtitle2">Header</Typography><pre>{decodedHeader}</pre>
                <Typography variant="subtitle2">Payload</Typography><pre>{decodedPayload}</pre>
              </AccordionDetails>
            </Accordion>
            <Accordion disabled={currentMissionStep < 2}>
              <AccordionSummary expandIcon={<ExpandMore />}><Adb sx={{mr:1}}/> <Typography>Bruteforcer le Secret</Typography></AccordionSummary>
              <AccordionDetails>
                   <Typography variant="body2" gutterBottom>Le secret est sûrement trivial...</Typography>
                  {!isCracking && !crackedSecret && <Button variant="contained" onClick={() => setIsCracking(true)}>Lancer le bruteforce</Button>}
                  {isCracking && <HackerAnimation onComplete={() => { setIsCracking(false); setCrackedSecret('secret'); }} />}
                  {crackedSecret && <Alert severity="warning">SECRET TROUVÉ : <strong>{crackedSecret}</strong></Alert>}
              </AccordionDetails>
            </Accordion>
             <Accordion disabled={currentMissionStep < 2}>
              <AccordionSummary expandIcon={<ExpandMore />}><Send sx={{mr:1}}/> <Typography>Atelier de Forge</Typography></AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" gutterBottom>Le payload initial est <code>{`{"role":"guest"}`}</code>. Quel rôle pourrait contrôler une machine à café ?</Typography>
                <TextField label="Payload à forger" value={forgePayload} onChange={(e) => setForgePayload(e.target.value)} fullWidth margin="normal" helperText='Ex: {"role": "???"}' />
                <TextField label="Secret" value={forgeSecret} onChange={(e) => setForgeSecret(e.target.value)} fullWidth margin="normal" />
                <Button variant="contained" onClick={handleForge} sx={{ mt: 1 }}>Forger le Token</Button>
                {forgedToken && <TextField 
                  label={tokenCopied ? "Token Copié !" : "Token Forgé (cliquez pour copier)"}
                  value={forgedToken} 
                  fullWidth 
                  margin="normal" 
                  multiline 
                  rows={4} 
                  InputProps={{ readOnly: true }} 
                  onClick={() => {
                    navigator.clipboard.writeText(forgedToken);
                    setTokenCopied(true);
                    setTimeout(() => setTokenCopied(false), 2000);
                  }}
                  sx={{ cursor: 'pointer' }}
                />}
              </AccordionDetails>
            </Accordion>
          </Box>
        </Drawer>
      </Container>
    </ThemeProvider>
  );
};

export default App;