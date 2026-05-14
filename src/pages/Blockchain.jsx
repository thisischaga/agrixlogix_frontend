import React, { useState, useEffect } from 'react';
//import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
//import { Badge } from '../components/Badge';
//import { Button } from '../components/ui/button';
//import { Alert, AlertDescription } from '../components/ui/alert';
import { Activity, TrendingUp, Clock, CheckCircle, XCircle, RefreshCw, Eye, Zap } from 'lucide-react';
import { useToast } from '../utils/useToast';
import client from '../api/client';

export default function BlockchainPage() {
  const [blockchainData, setBlockchainData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coopId, setCoopId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedCoop = localStorage.getItem('selectedCooperative');
    if (storedCoop) {
      setCoopId(JSON.parse(storedCoop)._id);
    }
  }, []);

  const fetchBlockchainData = async () => {
    if (!coopId) return;

    try {
      setRefreshing(true);

      // Récupérer les données générales de la blockchain
      const [statsRes, blockchainRes, txRes] = await Promise.all([
        client.get(`/cooperatives/${coopId}/stats`),
        client.get(`/cooperatives/${coopId}/blockchain/status`),
        client.get(`/cooperatives/${coopId}/blockchain/transactions`)
      ]);

      setStats(statsRes.data);
      setBlockchainData(blockchainRes.data);
      setTransactions(txRes.data.slice(0, 20)); // Dernières 20 transactions

    } catch (error) {
      console.error('Erreur chargement blockchain:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données blockchain",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (coopId) {
      fetchBlockchainData();
    }
  }, [coopId]);

  const getStatusColor = (status) => {
    if (status?.includes('Configurer')) return 'warning';
    if (status?.includes('Hors chaîne')) return 'neutral';
    if (status?.includes('indisponible')) return 'danger';
    return 'success';
  };

  const getStatusIcon = (status) => {
    if (status?.includes('Configurer') || status?.includes('Hors chaîne')) return <Clock size={16} />;
    if (status?.includes('indisponible')) return <XCircle size={16} />;
    return <CheckCircle size={16} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!coopId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Veuillez sélectionner une coopérative pour accéder aux données blockchain.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blockchain</h1>
          <p className="text-gray-600 mt-2">Trafic et flux des transactions blockchain</p>
        </div>
        <Button
          onClick={fetchBlockchainData}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </Button>
      </div>

      {/* Status de la Blockchain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Statut de la Blockchain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Badge
                variant={getStatusColor(blockchainData?.blockchain?.status)}
                icon={getStatusIcon(blockchainData?.blockchain?.status)}
              >
                {blockchainData?.blockchain?.status || 'Chargement...'}
              </Badge>
            </div>

            {blockchainData?.blockchain?.latestBlock && (
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Dernier bloc: #{blockchainData.blockchain.latestBlock}
                </span>
              </div>
            )}

            {blockchainData?.blockchain?.network && (
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Réseau: {blockchainData.blockchain.network}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Solde Blockchain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.balance?.toLocaleString() || 0} FCFA
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Solde actuel sur la blockchain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {transactions.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Transactions récentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Volume Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {transactions.reduce((sum, tx) => sum + parseInt(tx.montant || 0), 0).toLocaleString()} FCFA
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Volume des 20 dernières transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flux des Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            Flux des Transactions Blockchain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>Aucune transaction blockchain trouvée</p>
              </div>
            ) : (
              transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.typeOp === 'COTISATION' ? 'bg-green-100 text-green-600' :
                      tx.typeOp === 'ACHAT' ? 'bg-red-100 text-red-600' :
                      tx.typeOp === 'PRIME' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {tx.typeOp === 'COTISATION' ? '💰' :
                       tx.typeOp === 'ACHAT' ? '🛒' :
                       tx.typeOp === 'PRIME' ? '🏆' : '💸'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.timestamp).toLocaleString('fr-FR')}
                      </p>
                      {tx.txHash && (
                        <p className="text-xs text-gray-400 font-mono">
                          {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={
                      tx.typeOp === 'COTISATION' || tx.typeOp === 'PRIME' ? 'success' :
                      tx.typeOp === 'ACHAT' ? 'danger' : 'info'
                    }>
                      {tx.typeOp}
                    </Badge>
                    <p className={`text-lg font-bold mt-1 ${
                      tx.typeOp === 'COTISATION' || tx.typeOp === 'PRIME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.typeOp === 'COTISATION' || tx.typeOp === 'PRIME' ? '+' : '-'}
                      {parseInt(tx.montant).toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informations Techniques */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Contrat:</strong> CoopLedger</p>
                <p><strong>Réseau:</strong> {blockchainData?.blockchain?.network || 'Local'}</p>
                <p><strong>Statut:</strong> {blockchainData?.blockchain?.onChain ? 'En ligne' : 'Hors ligne'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Métriques</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Transactions totales:</strong> {transactions.length}</p>
                <p><strong>Dernière activité:</strong> {
                  transactions.length > 0
                    ? new Date(transactions[0].timestamp).toLocaleString('fr-FR')
                    : 'Aucune'
                }</p>
                <p><strong>Gas utilisé:</strong> Estimé</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}