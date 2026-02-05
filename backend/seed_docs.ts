
import { clientRepository, yearRepository, documentRepository, userRepository } from './src/repositories';
import { connectDatabase, disconnectDatabase } from './src/config';
import { initializeAssociations } from './src/models';

const seedDocs = async () => {
  try {
    await connectDatabase();
    initializeAssociations();

    const mobile = "+918849083015";
    console.log(`Seeding docs for mobile: ${mobile}`);

    // Find user
    const user = await userRepository.findByMobile(mobile);
    if (!user) {
      console.log("User not found!");
      return;
    }

    const client = await clientRepository.findByUserId(user.id);
    if (!client) {
      console.log("Client not found!");
      return;
    }

    console.log(`Client Found: ${client.code} (${client.id})`);

    // Check/Create Year 2021
    let year2021 = (await yearRepository.findByClientId(client.id)).find(y => y.year === "2021");
    if (!year2021) {
      year2021 = await yearRepository.create({
        clientId: client.id,
        year: "2021"
      });
      console.log("Created Year 2021");
    }

    // Check/Create Year 2015 (as user asked for it)
    let year2015 = (await yearRepository.findByClientId(client.id)).find(y => y.year === "2015");
    if (!year2015) {
      year2015 = await yearRepository.create({
        clientId: client.id,
        year: "2015"
      });
      console.log("Created Year 2015");
    }

    // Add dummy document to 2015
    await documentRepository.create({
      yearId: year2015.id,
      originalName: "Tax_Return_2015.pdf",
      mimeType: "application/pdf",
      size: 1024 * 500, // 500KB
      fileName: "dummy-key-2015",
      s3Path: "dummy-path-2015", // In real app this points to S3
      uploadedBy: user.id
    });
    console.log("Added dummy document to 2015");

    // Add dummy document to 2021
    await documentRepository.create({
      yearId: year2021.id,
      originalName: "Balance_Sheet_2021.pdf",
      mimeType: "application/pdf",
      size: 1024 * 1024, // 1MB
      fileName: "dummy-key-2021",
      s3Path: "dummy-path-2021",
      uploadedBy: user.id
    });
    console.log("Added dummy document to 2021");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

seedDocs();
