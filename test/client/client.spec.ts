import {
  AccountMongoRepository,
  AccountType,
  ClientFactory,
  ClientMongoRepository,
  IAccount,
  IClient,
  IClientRepository,
  IndividualDTO,
} from "../../src";

describe("Client", () => {
  it("new indivual account", async () => {
    const payload = {
      firstName: "felipe",
      middleName: "moura",
      lastName: "silva",
      email: "felipe@email222.com",
      dateBirth: "1987-02-23",
      dni: "187263254",
      taxId: "",
      passport: "5882997992",
      phoneCountry: "+55",
      phoneNumber: "2191256101",
      streetOne: "rua dos bobos, 0",
      streetTwo: "rua vazia, 1",
      postalCode: "33106",
      city: "MIAMI",
      region: "FLORIDA",
      country: "US",
      referredByAccountId: "",
    } as unknown as IndividualDTO;

    const account =
      await AccountMongoRepository.instance().findByAccountId("DANIELLEE002");

    const client = await ClientFactory.createNewClient(
      payload,
      AccountType.INDIVIDUAL,
      account,
    );

    console.log("client", client);
  });

  it("should return data of the client", async () => {
    const client =
      await ClientMongoRepository.instance().findByClientId(
        "ABejarano186263254",
      );
    console.log(client);
  });

  it("should return data of the client by email", async () => {
    const client = await ClientMongoRepository.instance().findByEmail(
      "programador.angel@gmail.com",
    );
    console.log(client);
  });

  it("should update data of the client", async () => {
    const client =
      await ClientMongoRepository.instance().findByClientId("PNOBA123654");

    const data = client.toPrimitives();

    data.firstName = "Angel Test";
    data.middleName = "Angel Test";
    data.lastName = "Angel Test";
    client.updateData(data);

    await ClientMongoRepository.instance().upsert(client);
  });

  it("Approve client", async () => {
    const clientRepo: IClientRepository = ClientMongoRepository.instance();

    const payload = {
      firstName: "crash",
      middleName: "naugthy dog",
      lastName: "bandcoot",
      email: "crash@universal.com",
      dateBirth: "1987-02-23",
      dni: "187263254",
      taxId: "",
      passport: "5882997992",
      phoneCountry: "+55",
      phoneNumber: "2191256101",
      streetOne: "rua dos bobos, 0",
      streetTwo: "rua vazia, 1",
      postalCode: "33106",
      city: "- ASTORIA",
      region: "todo FLORIDA",
      country: "todo US",
      referredByAccountId: "",
    } as unknown as IndividualDTO;

    const account =
      await AccountMongoRepository.instance().findByAccountId("DANIELLEE002");

    const client = await ClientFactory.createNewClient(
      payload,
      AccountType.INDIVIDUAL,
      account,
    );

    client.approveSegregated();

    await clientRepo.upsert(client);
  });

  it("Reject client", async () => {
    const clientRepo: IClientRepository = ClientMongoRepository.instance();

    const payload = {
      firstName: "mario",
      middleName: "luigi",
      lastName: "bros XD",
      email: "mario@nintendo.com",
      dateBirth: "1987-02-23",
      dni: "187263254",
      taxId: "",
      passport: "5882997992",
      phoneCountry: "+55",
      phoneNumber: "2191256101",
      streetOne: "rua dos bobos, 0",
      streetTwo: "rua vazia, 1",
      postalCode: "33106",
      city: "- ASTORIA",
      region: "todo FLORIDA",
      country: "todo US",
      referredByAccountId: "",
    } as unknown as IndividualDTO;

    const account: IAccount =
      await AccountMongoRepository.instance().findByAccountId("DANIELLEE002");

    const client: IClient = await ClientFactory.createNewClient(
      payload,
      AccountType.INDIVIDUAL,
      account,
    );

    client.rejectSegregated();

    await clientRepo.upsert(client);
  });

  it("Add kyc requested changes to client NATURAL", async () => {
    const clientRepo: IClientRepository = ClientMongoRepository.instance();
    const email: string = "sonic_kyc@pc.com";
    const payload = {
      firstName: "kyc sonic",
      middleName: "luigi",
      lastName: "bros XD",
      email,
      dateBirth: "1987-02-23",
      dni: "187263254",
      taxId: "",
      passport: "5882997992",
      phoneCountry: "+55",
      phoneNumber: "2191256101",
      streetOne: "rua dos bobos, 0",
      streetTwo: "rua vazia, 1",
      postalCode: "33106",
      city: "- ASTORIA",
      region: "todo FLORIDA",
      country: "todo US",
      referredByAccountId: "",
    } as unknown as IndividualDTO;

    const account: IAccount =
      await AccountMongoRepository.instance().findByAccountId("DANIELLEE002");

    const client: IClient = await ClientFactory.createNewClient(
      payload,
      AccountType.INDIVIDUAL,
      account,
    );

    client.setKycAction({
      action: "cambiar foto de perfil",
      date: new Date(),
      id: "",
    });

    client.setKycAction({
      action: "agregar foto de pasaporte",
      date: new Date(),
      id: "",
    });

    await clientRepo.upsert(client);
  });

  it("Add kyc requested changes to client NATURAL", async () => {
    const clientRepo: IClientRepository = ClientMongoRepository.instance();
    const client = await clientRepo.findByClientId("MMainbeneficiary789975243");

    client.setKycAction({
      action: "cambiar foto de perfil",
      date: new Date(),
      id: "",
    });

    client.setKycAction({
      action: "agregar foto de pasaporte",
      date: new Date(),
      id: "",
    });

    await clientRepo.upsert(client);
  });

  it("Get kyc actions client NATURAL", async () => {
    const clientRepo: IClientRepository = ClientMongoRepository.instance();
    const client = await clientRepo.findByClientId("MMainbeneficiary789975243");

    console.log("actions", client.getKycActions());
  });

  it("Delete kyc action client NATURAL", async () => {
    const clientRepo: IClientRepository = ClientMongoRepository.instance();
    const client: IClient = await clientRepo.findByClientId(
      "MMainbeneficiary789975243",
    );

    client.deleteKycAction("kyc-0.18776280337277518");

    await clientRepo.upsert(client);
  });

  it("Add KYC to company client partner", async () => {
    const clientRepo: IClientRepository = ClientMongoRepository.instance();
    const client: IClient = await clientRepo.findByClientId(
      "DE-PRUEBA PARA PRUEBA (XXXX)66.716.343/0001-82",
    );

    client.setKycActionToPartner({
      action: "rk",
      date: new Date(),
      dni: "11111",
      id: "555",
    });

    client.setKycActionToPartner({
      action: "2 test",
      date: new Date(),
      dni: "187263254",
      id: "2",
    });

    client.setKycActionToPartner({
      action: "final test",
      date: new Date(),
      dni: "11111",
      id: "142fgdasfgdfg",
    });

    await clientRepo.upsert(client);
  });

  it("Delete kyc action to partner", async () => {
    const clientRepo: IClientRepository = ClientMongoRepository.instance();
    const client: IClient = await clientRepo.findByClientId(
      "DE-PRUEBA PARA PRUEBA (XXXX)66.716.343/0001-82",
    );

    client.deleteKycActionToPartner({
      action: "rk",
      date: new Date(),
      dni: "187263254",
      id: "1",
    });

    await clientRepo.upsert(client);
  });

  it("should add kyc to partner of a client company", async () => {
    const client =
      await ClientMongoRepository.instance().findByClientId("semodo12344321");

    const partners = client.getCompanyPartners();
    console.log("partners", partners);

    const partner = client.getCompanyToPrimitives().partners[0];
    // client.deleteAllDocumentsPartners(partner.dni);

    // client.setDocument(
    //   partner.dni,
    //   Documents.newDocument(
    //     partner.dni,
    //     "/home/abejarano/Downloads/2.png",
    //     DocumentType.GOVERNMENT_ID,
    //     DocumentSide.BACK,
    //   ),
    // );
    const partner1Id = "123412341234";
    client.setKycActionToPartner({
      id: Math.random().toString(),
      dni: partner1Id,
      action: "individual dto test!",
      date: new Date(),
    });
    const partner2Id = "123443212";
    client.setKycActionToPartner({
      id: Math.random().toString(),
      dni: partner2Id,
      action: "fourth kyc action",
      date: new Date(),
    });
    await ClientMongoRepository.instance().upsert(client);

    console.log("client", client.getCompanyPartners());
    // expect(client.toPrimitives().partners[0].documents.length === 1).toBe(true);
  });

  it("should add general kyc to Company, client company", async () => {
    const client =
      await ClientMongoRepository.instance().findByClientId("semodo12344321");

    client.setKycAction({
      id: Math.random().toString(),
      action: "second kyc action",
      date: new Date(),
    });
    await ClientMongoRepository.instance().upsert(client);
  });

  it("should get general kyc Company actions, client company", async () => {
    const client =
      await ClientMongoRepository.instance().findByClientId("semodo12344321");

    console.log("actions", client.getKycActions());
  });

  it("should delete general kyc to Company, client company", async () => {
    const client =
      await ClientMongoRepository.instance().findByClientId("semodo12344321");

    client.deleteKycAction("0.34443428785307506");
    await ClientMongoRepository.instance().upsert(client);
  });

  it("Should set FeeACHPanama", async () => {
    const client =
      await ClientMongoRepository.instance().findByClientId(
        "MSerrano181263254",
      );
  });

  it("Should search client by dni, type natural person", async () => {
    const dni = "181263254";

    const client = await ClientMongoRepository.instance().findByDni(dni);

    expect(client).not.toBe(undefined);
  });

  it("Should search client by company name, type company", async () => {
    const registerNumber = "2165954156";

    const client =
      await ClientMongoRepository.instance().findByDni(registerNumber);

    expect(client).not.toBe(undefined);
  });
});
