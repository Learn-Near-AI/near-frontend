// Cross-contract call examples
export const crossContractCode = {
  'simple-calls': {
    Rust: `use near_sdk::{near_bindgen, env, AccountId, Promise};

#[near_bindgen]
#[derive(Default)]
pub struct Contract {}

#[near_bindgen]
impl Contract {
    pub fn call_other_contract(&self, contract_id: AccountId, method_name: String) -> Promise {
        Promise::new(contract_id)
            .function_call(
                method_name,
                b"{}".to_vec(),
                0,
                env::prepaid_gas() / 2,
            )
    }
}`,
    JavaScript: `import { NearBindgen, call, near } from "near-sdk-js";

@NearBindgen({})
class Contract {
  @call({})
  call_other_contract({ contract_id, method_name }) {
    return near.promiseBatchCreate(contract_id)
      .then(near.promiseBatchActionFunctionCall(
        method_name,
        JSON.stringify({}),
        0,
        near.prepaidGas() / 2
      ));
  }
}

export default Contract;`,
  },
  'promises': {
    Rust: `use near_sdk::{near_bindgen, env, AccountId, Promise};

#[near_bindgen]
#[derive(Default)]
pub struct Contract {}

#[near_bindgen]
impl Contract {
    pub fn create_promise(&self, contract_id: AccountId) -> Promise {
        Promise::new(contract_id)
            .function_call(
                b"get_value".to_vec(),
                b"{}".to_vec(),
                0,
                env::prepaid_gas() / 2,
            )
    }
}`,
    JavaScript: `import { NearBindgen, call, near } from "near-sdk-js";

@NearBindgen({})
class Contract {
  @call({})
  create_promise({ contract_id }) {
    return near.promiseBatchCreate(contract_id)
      .then(near.promiseBatchActionFunctionCall(
        "get_value",
        JSON.stringify({}),
        0,
        near.prepaidGas() / 2
      ));
  }
}

export default Contract;`,
  },
}

