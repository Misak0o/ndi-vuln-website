import React from 'react';
import { Typography, Button, Paper } from '@mui/material';
import { Coffee } from '@mui/icons-material';

const coffeeArt = `
         {
      {   }
    }   }
   }   }
  }   }
 ((((
-------
|     |]
|     |]
|     |]
 \___/    
`;

interface VictoryPageProps {
  message: string;
}

const VictoryPage: React.FC<VictoryPageProps> = ({ message }) => {
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <Paper elevation={12} sx={{ p: 4, textAlign: 'center', borderColor: 'primary.main', borderWidth: '2px', borderStyle: 'solid' }}>
      <Coffee sx={{ fontSize: 60, color: 'primary.main' }} />
      <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 2 }}>
        VOUS ÊTES LE MAÎTRE DU CAFÉ !
      </Typography>
      <pre style={{ fontSize: '1.2rem', margin: '20px 0' }}>{coffeeArt}</pre>
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
      <Button variant="contained" color="secondary" sx={{ mt: 4 }} onClick={handleReset}>
        Recommencer la mission
      </Button>
    </Paper>
  );
};

export default VictoryPage;
