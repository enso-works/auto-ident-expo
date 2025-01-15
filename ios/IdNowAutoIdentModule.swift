import ExpoModulesCore
import IDNowSDKCore


func convertToJsonString<T: Encodable>(data: T) -> String? {
    do {
        let jsonData = try JSONEncoder().encode(data)
        let jsonString = String(data: jsonData, encoding: .utf8)
        return jsonString
    } catch {
        print("Error converting to JSON: \(error)")
        return nil
    }
}

struct IdentResult : Codable {
    var status: String
    var errorCode: String
}


func generateJSON(result: IdentResult) ->  String? {
    if let jsonString = convertToJsonString(data: result) {
        return jsonString
    } else {
        return "failed to pars object"
    }
}

func turnResultToString(result: IDNowSDK.IdentResult.type) -> String {
    if result == .CANCELLED {
        return "CANCELED"
    }
    else if result == .FINISHED {
        return "FINISHED"
    }
    return "ERROR"

}

public class IdNowAutoIdentModule: Module {

  public func definition() -> ModuleDefinition {
    Name("IdNowAutoIdent")
    AsyncFunction("start") { (token: String, preferredLanguage: String, promise: Promise) in
      if let rootViewController = UIApplication.shared.delegate?.window??.rootViewController {
        IDNowSDK.shared.start(token: token, preferredLanguage:preferredLanguage, fromViewController: rootViewController, listener:{(result: IDNowSDK.IdentResult.type, statusCode: IDNowSDK.IdentResult.statusCode, message: String) in
            let idkRes = IdentResult(status: turnResultToString(result: result), errorCode: statusCode.description)
            promise.resolve(generateJSON(result: idkRes))

        })
      } else {
          promise.resolve("failed to identify rootViewControler")
      }
    }
  }
}
