from datetime import date, datetime
from typing import List, Dict
from ..config import settings

# Provider simples que usa .env para identificar a "conta padrão".
# Integração real deve ser feita aqui (Belvo/Open Finance) mantendo as mesmas interfaces.
class BankProvider:
    def _account_dict(self):
        masked = settings.BANK_ACCOUNT[-4:] if len(settings.BANK_ACCOUNT) >= 4 else settings.BANK_ACCOUNT
        name = f"Banco {settings.BANK_NUMBER} Ag {settings.BANK_AGENCY} Cc ***{masked}"
        return {
            "id": f"acc_{settings.BANK_NUMBER}_{settings.BANK_AGENCY}_{settings.BANK_ACCOUNT}".replace("-", ""),
            "provider": "manual-env",
            "name": name,
            "masked_account_number": f"***{masked}"
        }

    def list_accounts(self, user_id: int) -> List[Dict]:
        return [self._account_dict()]

    def get_balance(self, account_id: str) -> Dict:
        return {
            "account_id": account_id,
            "currency": "BRL",
            "available": 12345.67,
            "ledger": 12345.67,
            "as_of": datetime.utcnow().isoformat() + "Z",
        }

    def get_transactions(self, account_id: str, from_date: date | None, to_date: date | None) -> List[Dict]:
        today = date.today().isoformat()
        return [
            {"id": "tx_001", "date": today, "amount": -58.90, "description": "SUPERMERCADO XYZ"},
            {"id": "tx_002", "date": today, "amount": -120.00, "description": "ENERGIA ELETRICA"},
            {"id": "tx_003", "date": today, "amount": 2000.00, "description": "DEP SALARIO"},
        ]

provider = BankProvider()
